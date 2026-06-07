-- DeBarrio — El organizador puede LEER (signed URL) los comprobantes de su grupo.
-- Cierra el hueco de 0002_storage: el bucket es privado y solo el dueño (jugador)
-- leía su comprobante; el organizador confirmaba a ciegas. La ruta es
-- {jugador_id}/{pago_id}.{ext}; se extrae el pago_id del nombre del archivo y se
-- valida es_organizador() sobre el grupo de ese pago.

create policy comprobante_organizador_select on storage.objects for select to authenticated
  using (
    bucket_id = 'comprobantes'
    and exists (
      select 1 from pagos pg
      where pg.id = nullif(split_part(storage.filename(name), '.', 1), '')::uuid
        and es_organizador(grupo_de_partido(pg.partido_id))
    )
  );
