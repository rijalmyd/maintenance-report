import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir = path.join(process.cwd(), 'storage/uploads/signature');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const form = formidable({
        uploadDir,
        keepExtensions: true,
      });

      const [fields, files] = await form.parse(req);
      
      const imageFile = files.image?.[0];
      const nameField = fields.name?.[0];

      if (!imageFile || !nameField) {
        if (imageFile) fs.unlinkSync(imageFile.filepath);
        return res.status(400).json({ success: false, message: 'Name and Image are required' });
      }

      const safeName = path.basename(nameField).replace(/\s+/g, '_');
      const finalPath = path.join(uploadDir, `${safeName}.png`);

      await fs.promises.rename(imageFile.filepath, finalPath);

      return res.status(200).json({
        success: true,
        message: 'Signature saved successfully',
        data: {
          name: safeName,
          path: `storage/uploads/signatures/${safeName}.png`,
        },
      });

    } else if (req.method === 'DELETE') {
      const { name } = req.query;
      
      if (!name) return res.status(400).json({ message: 'Name parameter is required' });

      const filePath = path.join(uploadDir, `${path.basename(name as string)}.png`);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return res.status(200).json({ success: true, message: 'Signature deleted' });
      }
      
      return res.status(404).json({ message: 'File not found' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}