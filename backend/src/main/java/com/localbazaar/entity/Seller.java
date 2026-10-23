package com.localbazaar.entity;

import com.localbazaar.domain.SellerStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private String shopName;

    @Column(length = 2000)
    private String description;

    private String city;
    private String address;
    private String phone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SellerStatus status = SellerStatus.PENDING;
}
