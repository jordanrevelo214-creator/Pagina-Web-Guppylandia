-- ============================================
-- GUPPYLANDIA - Esquema de Base de Datos D1
-- ============================================

-- Tabla principal de productos
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    descripcion TEXT,
    imagen TEXT,
    categoria TEXT NOT NULL,  -- 'peces', 'plantas', 'productos'
    activo INTEGER NOT NULL DEFAULT 1,  -- 1 = visible, 0 = oculto
    destacado INTEGER NOT NULL DEFAULT 0, -- 1 = destacado en inicio, 0 = normal
    created_at TEXT DEFAULT (datetime('now'))
);

-- Insertar los productos que ya tienes
-- PECES
INSERT INTO productos (nombre, precio, stock, descripcion, imagen, categoria) VALUES
('Guppy Cobra', 3.50, 15, 'Coloración vibrante con patrón cobra único.', 'https://flipaquatics.com/cdn/shop/files/FA-Fish-GreenCobraGuppy_Male-M1W324_5000x.jpg?v=1762530390', 'peces'),
('Betta Dragon Red', 12.00, 2, 'Ejemplar de exhibición con escamas dragón.', 'https://tropicflow.com/cdn/shop/files/IMG-4215.jpg?v=1769396180&width=713', 'peces'),
('Tetra Neón', 1.50, 50, 'El clásico cardumen brillante para cualquier acuario.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwX3E7CymkCgTym4v79K3gVvWLmx59aqqLbg&s', 'peces'),
('Corydora Albina', 4.00, 3, 'Limpiador de fondo pacífico y llamativo.', 'https://aquaorinoco.com/17069/corydoras-paleatus-albina.jpg', 'peces'),
('Acara Blue', 11.00, 5, 'Pez grande y territorial, ideal para acuarios amplios.', 'https://d2j6dbq0eux0bg.cloudfront.net/images/82764095/4781208683.jpg', 'peces'),
('Tetra Rojito', 1.00, 12, 'Un pez muy carismático y divertido para el acuario.', 'https://www.fishipedia.es/wp-content/uploads/2015/02/Hyphessobrycon-sweglesi-elevage.jpg', 'peces'),
('Tetra Monjita', 1.00, 12, 'Pez de cardumen muy activo y sociable.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBI13CGg4VSvpddJi0G6DnV61qkzz3U4eF7A&s', 'peces'),
('Ramirezi Electric Blue', 5.00, 4, 'Pez de cardumen muy popular y llamativo por sus colores vibrantes.', 'https://www.swelluk.com/media/catalog/product/e/l/electric_blue_ram.png?width=810&height=810&store=default&image-type=image', 'peces'),
('Otocinclus', 1.00, 10, 'Excelente limpiador de algas.', 'https://images.unsplash.com/photo-1518472898294-f9044b2ca07d?w=500&auto=format&fit=crop&q=60', 'peces');

-- PLANTAS
INSERT INTO productos (nombre, precio, stock, descripcion, imagen, categoria) VALUES
('Cryptocoryne wendtii Green', 3.50, 15, 'Plantas de acuario de fácil cuidado y crecimiento lento.', 'https://i.etsystatic.com/22016538/r/il/0f365a/2552530212/il_794xN.2552530212_1voc.jpg', 'plantas'),
('Lysmachia nummularia Aurea', 12.00, 2, 'Una planta terrestre que se adapta muy bien a la acuariofilia.', 'https://www.lumalightstudio.com.mx/cdn/shop/products/Lysimachia_nummularia_aurea_3_1200x_78469105-c148-40a4-abd5-004d39afe887_720x.jpg?v=1638819012', 'plantas'),
('Cryptocoryne pontederiifolia', 1.50, 50, 'Una planta con hojas grandes y un tallo robusto, ideal para acuarios medianos y grandes.', 'https://d2seqvvyy3b8p2.cloudfront.net/66e4a6c35ca20c625d8b3ea78188f19b.jpg', 'plantas'),
('Hygrophila polysperma', 2.50, 3, 'Su belleza y color cambia dependiendo de la luz. Crecimiento rápido.', 'https://aquariumbreeder.com/wp-content/uploads/2024/01/Hygrophila-Polysperma-Care-Guide-%E2%80%93-Planting-Growing-and-Propagation.jpg', 'plantas');

-- PRODUCTOS (acondicionadores, abonos, etc.)
INSERT INTO productos (nombre, precio, stock, descripcion, imagen, categoria) VALUES
('Prime Seachem 100ml', 10.00, 15, 'Su función principal es neutralizar el cloro y la cloramina, además de desintoxicar temporalmente el amoníaco, nitritos y nitratos.', 'https://simplyfish.store/cdn/shop/files/LA02_e1879193-2de5-496c-b31c-154889310725_1024x.png?v=1738564426', 'productos'),
('Algae away Azoo', 10.00, 2, 'Es un producto eficaz contra las algas filamentosas en acuarios plantados. Se aplica de manera diluida.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIWwrPeMDL0lkqic7v8mx8vTfTma47hjA0bw&s', 'productos'),
('Flourish Seachem 100ml', 10.00, 50, 'Es una fuente integral de micronutrientes diseñada para promover el crecimiento exuberante y la coloración vibrante de las plantas acuáticas.', 'https://i0.wp.com/atlantisacuario.com/wp-content/uploads/2020/12/Atlantis-Acuario-Seachem-Florish-250ml.jpg?fit=800%2C800&ssl=1', 'productos'),
('Plant Premium Azoo', 10.00, 3, 'Es un abono completo y balanceado para plantas acuáticas que proporciona todos los nutrientes esenciales para su crecimiento y desarrollo.', 'https://azooeurope.com/wp-content/uploads/azoo_plus_plant_premium_01.jpg', 'productos');

-- Tabla de configuración del admin (contraseña)
CREATE TABLE IF NOT EXISTS admin_config (
    id INTEGER PRIMARY KEY,
    clave TEXT NOT NULL
);

-- Contraseña por defecto del admin (cambiar después)
INSERT INTO admin_config (id, clave) VALUES (1, 'guppylandia2026');
