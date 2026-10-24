package com.localbazaar.repository;

import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUser(User user);

    @Query("select s from Seller s join fetch s.user order by s.id")
    List<Seller> findAllWithUser();
}
