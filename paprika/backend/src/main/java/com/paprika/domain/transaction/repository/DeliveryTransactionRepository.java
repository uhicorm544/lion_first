package com.paprika.domain.transaction.repository;

import com.paprika.domain.transaction.entity.DeliveryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 담당: D - 이동준
 */
public interface DeliveryTransactionRepository extends JpaRepository<DeliveryTransaction, Long> {
}
