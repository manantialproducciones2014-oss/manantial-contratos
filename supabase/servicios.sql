-- Actualizar constraint de combos para incluir 'Servicio'
alter table combos drop constraint if exists combos_tipo_check;
alter table combos add constraint combos_tipo_check
  check (tipo in ('XV Años', 'Boda', 'Adicional', 'Servicio'));

-- Actualizar constraint de contratos para incluir 'Servicio'
alter table contratos drop constraint if exists contratos_tipo_evento_check;
alter table contratos add constraint contratos_tipo_evento_check
  check (tipo_evento in ('XV Años', 'Boda', 'Empresarial', 'Servicio'));

-- Insertar los nuevos combos de servicio
insert into combos (nombre, tipo, precio, cuotas_cantidad, cuotas_monto, servicios) values
('Espejo Mágico', 'Servicio', 290000, 1, 290000, ARRAY[
  'Fotos ILIMITADAS impresas al momento de alta calidad (10cm x 15cm)',
  'Los invitados podrán dejarle una firma a su foto',
  'Cotillón PREMIUM: gorros, lentes, máscaras',
  'Ideal para Souvenir — cada invitado puede llevarse su foto impresa',
  'Diseño de Plantilla Personalizado',
  'Separadores para protección',
  'Fotos enviadas de manera Digital',
  '2 Operadores para mantener el Orden en el Servicio'
]),
('Plataforma 360°', 'Servicio', 290000, 1, 290000, ARRAY[
  'Videos Sin Límites entregados en el Momento por QR',
  'Elección de 3 canciones para los videitos',
  'Nombre o Logo del Evento en los videos',
  'Pistola Lanza Billetes para uso de los agasajados',
  'Máquina de Burbujas',
  'Barras Led de decoración',
  'Cotillón PREMIUM: gorros, lentes y máscaras',
  'Cámara GoPro para calidad de vídeo excelente',
  'Separadores para Protección',
  '2 Operadores para mantener el Orden en el Servicio'
]);
