package com.localbazaar.repository;

import com.localbazaar.entity.CustomerOrder;
import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @Query("""
            select distinct o from CustomerOrder o
            left join fetch o.items i
            left join fetch i.product
            left join fetch o.seller
            where o.customer = :customer
            order by o.createdAt desc
            """)
    List<CustomerOrder> findByCustomerWithItems(@Param("customer") User customer);

    @Query("""
            select distinct o from CustomerOrder o
            left join fetch o.items i
            left join fetch i.product
            left join fetch o.customer
            where o.seller = :seller
            order by o.createdAt desc
            """)
    List<CustomerOrder> findBySellerWithItems(@Param("seller") Seller seller);

    @Query("""
            select o from CustomerOrder o
            left join fetch o.items i
            left join fetch i.product
            left join fetch o.seller
            left join fetch o.customer
            where o.id = :id
            """)
    Optional<CustomerOrder> findByIdWithItems(@Param("id") Long id);

    List<CustomerOrder> findBySeller(Seller seller);
}
