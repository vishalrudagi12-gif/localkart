package com.localbazaar.repository;

import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUser(User user);
}
