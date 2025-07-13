
-- Add WhatsApp and Instagram columns to the clients table
ALTER TABLE public.clients 
ADD COLUMN whatsapp_url text,
ADD COLUMN instagram_url text;
