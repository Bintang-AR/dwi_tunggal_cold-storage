import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false
  }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: false });

    const [fields, files] = await form.parse(req);

    const nama = fields.nama?.[0] || '';
    const perusahaan = fields.perusahaan?.[0] || '';
    const text = fields.text?.[0] || '';

    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'File tidak ditemukan'
      });
    }

    const fileBuffer = fs.readFileSync(file.filepath);

    const fileName = `${Date.now()}-${file.originalFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('testimoni-media')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype
      });

    if (uploadError) {
      return res.status(500).json({
        success: false,
        error: uploadError.message
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('testimoni-media')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('testimoni')
      .insert([
        {
          nama,
          perusahaan,
          text,
          file_path: publicUrlData.publicUrl,
          file_type: file.mimetype
        }
      ]);

    if (dbError) {
      return res.status(500).json({
        success: false,
        error: dbError.message
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}