-- DeBarrio — Storage: faltaba policy UPDATE en el bucket comprobantes.
-- subirComprobante() usa upsert:true; sin policy UPDATE, re-subir un comprobante
-- (corregir la foto) sobre un objeto ya existente falla con RLS.

create policy comprobante_owner_update on storage.objects for update to authenticated
  using (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
