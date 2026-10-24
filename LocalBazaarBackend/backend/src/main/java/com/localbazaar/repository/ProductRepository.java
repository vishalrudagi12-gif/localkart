package com.localbazaar.repository;

import com.localbazaar.entity.Product;
import com.localbazaar.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerOrderByCreatedAtDesc(Seller seller);

    Optional<Product> findBySellerAndNameIgnoreCase(Seller seller, String name);

    long countBySeller(Seller seller);

    List<Product> findByCategoryIgnoreCaseAndActiveTrueAndIdNot(String category, Long id);

    @Query("""
            select distinct p from Product p
            left join p.tags tag
            where p.active = true
              and (:q is null or :q = '' or lower(p.name) like lower(concat('%', :q, '%'))
                   or lower(coalesce(p.description, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(p.category, '')) like lower(concat('%', :q, '%')))
              and (:category is null or :category = '' or lower(p.category) = lower(:category))
              and (:tag is null or :tag = '' or lower(tag) = lower(:tag))
            order by p.createdAt desc
            """)
    List<Product> search(
            @Param("q") String q,
            @Param("category") String category,
            @Param("tag") String tag
    );
}
