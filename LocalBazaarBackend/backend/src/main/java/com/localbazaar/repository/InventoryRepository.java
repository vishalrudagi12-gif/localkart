package com.localbazaar.repository;

import com.localbazaar.entity.Inventory;
import com.localbazaar.entity.Product;
import com.localbazaar.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProduct(Product product);

    Optional<Inventory> findByProductId(Long productId);

    void deleteByProductId(Long productId);

    List<Inventory> findByProductSeller(Seller seller);
}
