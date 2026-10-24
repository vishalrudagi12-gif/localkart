package com.localbazaar.service;

import com.localbazaar.domain.Role;
import com.localbazaar.dto.ReviewRequest;
import com.localbazaar.dto.ReviewResponse;
import com.localbazaar.entity.Product;
import com.localbazaar.entity.Review;
import com.localbazaar.entity.User;
import com.localbazaar.repository.ProductRepository;
import com.localbazaar.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<ReviewResponse> forProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        User customer = currentUserService.requireRole(Role.CUSTOMER);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        reviewRepository.findByProductIdAndCustomerId(product.getId(), customer.getId())
                .ifPresent(r -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "You already reviewed this product");
                });
        Review review = Review.builder()
                .product(product)
                .customer(customer)
                .rating(request.getRating())
                .comment(request.getComment() == null || request.getComment().isBlank()
                        ? null
                        : request.getComment().trim())
                .build();
        reviewRepository.save(review);
        return toResponse(review);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .customerName(review.getCustomer().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
