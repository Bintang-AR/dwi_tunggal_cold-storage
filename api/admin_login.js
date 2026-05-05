export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { password } = req.body;

  const ADMIN_PASSWORD = 'jaki123';

  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({
      success: true
    });
  }

  return res.status(401).json({
    success: false
  });
}