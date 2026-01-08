CREATE TABLE equipamentos (
    id_equipamento BIGINT PRIMARY KEY IDENTITY,
    cpu_maquina VARCHAR(50),
    estado VARCHAR(255), 
    etiqueta VARCHAR(50) UNIQUE,
    fabricante VARCHAR(50),
    gpu VARCHAR(50),
    modelo VARCHAR(50),
    nota_fiscal VARCHAR(255), 
    patrimonio VARCHAR(50) NOT NULL UNIQUE,
    quantidade_armazenamento INT,
    quantidade_ram INT,
    tec VARCHAR(50),
    tipo_armazenamento VARCHAR(50),
    tipo_equipamento VARCHAR(255), 
    tipo_ram VARCHAR(50),
    valor DECIMAL(10,2)
);