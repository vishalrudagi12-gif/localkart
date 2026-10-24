package com.localbazaar.service;

import com.localbazaar.domain.SellerStatus;
import com.localbazaar.dto.ProductRequest;
import com.localbazaar.dto.ProductResponse;
import com.localbazaar.dto.SellerMeResponse;
import com.localbazaar.entity.Inventory;
import com.localbazaar.entity.Product;
import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import com.localbazaar.repository.InventoryRepository;
import com.localbazaar.repository.ProductRepository;
import com.localbazaar.repository.SellerRepository;
import com.localbazaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final MailService mailService;

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String q, String category, String tag) {
        return productRepository.search(blankToNull(q), blankToNull(category), blankToNull(tag))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getPublic(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> myProducts() {
        Seller seller = requireSeller();
        return productRepository.findBySellerOrderByCreatedAtDesc(seller).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SellerMeResponse me() {
        Seller seller = requireSeller(false);
        return SellerMeResponse.builder()
                .id(seller.getId())
                .shopName(seller.getShopName())
                .city(seller.getCity())
                .status(seller.getStatus())
                .build();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Seller seller = requireApprovedSeller();
        Product product = Product.builder()
                .seller(seller)
                .name(request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .price(request.getPrice())
                .category(trimToNull(request.getCategory()))
                .tags(normalizeTags(request.getTags()))
                .city(firstNonBlank(request.getCity(), seller.getCity()))
                .active(true)
                .build();
        productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(request.getQuantity())
                .lowStockThreshold(request.getLowStockThreshold())
                .build();
        inventoryRepository.save(inventory);
        maybeLowStockAlert(product, inventory);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = requireOwnedProduct(id);
        product.setName(request.getName().trim());
        product.setDescription(trimToNull(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setCategory(trimToNull(request.getCategory()));
        product.getTags().clear();
        product.getTags().addAll(normalizeTags(request.getTags()));
        product.setCity(firstNonBlank(request.getCity(), product.getSeller().getCity()));

        Inventory inventory = inventoryRepository.findByProduct(product)
                .orElseGet(() -> inventoryRepository.save(Inventory.builder().product(product).build()));
        inventory.setQuantity(request.getQuantity());
        inventory.setLowStockThreshold(request.getLowStockThreshold());
        maybeLowStockAlert(product, inventory);
        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = requireOwnedProduct(id);
        inventoryRepository.deleteByProductId(product.getId());
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse addImage(Long id, MultipartFile file) {
        Product product = requireOwnedProduct(id);
        String url = fileStorageService.store(file);
        product.getImageUrls().add(url);
        return toResponse(product);
    }

    private void maybeLowStockAlert(Product product, Inventory inventory) {
        if (inventory.getQuantity() <= inventory.getLowStockThreshold()) {
            String email = product.getSeller().getUser().getEmail();
            mailService.send(
                    email,
                    "Low stock: " + product.getName(),
                    "Quantity is " + inventory.getQuantity()
                            + " (threshold " + inventory.getLowStockThreshold() + ")."
            );
        }
    }

    public ProductResponse toPublicResponse(Product product) {
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> similar(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (product.getCategory() == null || product.getCategory().isBlank()) {
            return List.of();
        }
        return productRepository.findByCategoryIgnoreCaseAndActiveTrueAndIdNot(product.getCategory(), id)
                .stream()
                .limit(6)
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        Inventory inventory = inventoryRepository.findByProduct(product).orElse(null);
        int qty = inventory == null ? 0 : inventory.getQuantity();
        int threshold = inventory == null ? 5 : inventory.getLowStockThreshold();
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .tags(product.getTags() == null ? Set.of() : product.getTags())
                .imageUrls(product.getImageUrls() == null ? List.of() : product.getImageUrls())
                .city(product.getCity())
                .active(product.isActive())
                .sellerId(product.getSeller().getId())
                .shopName(product.getSeller().getShopName())
                .quantity(qty)
                .lowStockThreshold(threshold)
                .lowStock(qty <= threshold)
                .createdAt(product.getCreatedAt())
                .build();
    }

    private Product requireOwnedProduct(Long id) {
        Seller seller = requireApprovedSeller();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your product");
        }
        return product;
    }

    private Seller requireApprovedSeller() {
        return requireSeller(true);
    }

    private Seller requireSeller() {
        return requireSeller(false);
    }

    private Seller requireSeller(boolean mustBeApproved) {
        User user = currentUser();
        Seller seller = sellerRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller account required"));
        if (mustBeApproved && seller.getStatus() != SellerStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller account is not approved yet");
        }
        return seller;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required"));
    }

    private static Set<String> normalizeTags(List<String> tags) {
        if (tags == null) {
            return new LinkedHashSet<>();
        }
        return tags.stream()
                .filter(t -> t != null && !t.isBlank())
                .map(t -> t.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String trimToNull(String value) {
        return blankToNull(value);
    }

    private static String firstNonBlank(String preferred, String fallback) {
        String first = trimToNull(preferred);
        return first != null ? first : trimToNull(fallback);
    }
}
