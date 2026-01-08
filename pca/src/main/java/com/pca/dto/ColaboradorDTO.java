package com.pca.dto;

import com.pca.model.Colaborador;


public record ColaboradorDTO(
        Long id,
        String nome,
        String funcao,
        String chapa,
        String setor 
) {
        public static ColaboradorDTO fromEntity(Colaborador c){
                if (c == null)  return null;
                return new ColaboradorDTO(
                        c.getId(),
                        c.getNome(),
                        c.getFuncao(),
                        c.getChapa(),
                        c.getSetor()

                 );
         }
}


