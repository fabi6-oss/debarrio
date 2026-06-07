-- DeBarrio — Storage: comprobantes de transferencia (bucket privado)
-- Convención de ruta: {jugador_id}/{pago_id}.{ext}

insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

-- El jugador sube su comprobante en su propia carpeta (primer segmento = su uid)
create policy comprobante_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- El jugador lee/borra solo lo suyo
create policy comprobante_owner_select on storage.objects for select to authenticated
  using (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy comprobante_owner_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- NOTA: el organizador NO lee directo el bucket. Para que vea el comprobante,
-- el frontend pide una signed URL vía RPC SECURITY DEFINER (ver Fase 3),
-- que valida es_organizador() antes de firmar. Así no se expone el bucket.
