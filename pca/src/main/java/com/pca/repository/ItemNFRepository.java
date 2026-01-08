package com.pca.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pca.model.ItemNF;

@Repository
public interface ItemNFRepository extends JpaRepository<ItemNF, Long> {


}
