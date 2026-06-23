import fs from 'fs';

async function test() {
  const fileData = fs.readFileSync('d:/work/clothing/client/src/assets/hero_slide_1.png');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let body = '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="images"; filename="hero_slide_1.png"\r\n';
  body += 'Content-Type: image/png\r\n\r\n';
  
  const payload = Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileData,
    Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8')
  ]);
  
  const res = await fetch('http://localhost:5000/api/admin/upload', {
    method: 'POST',
    headers: { 
      'x-admin-password': 'supremeit2026',
      'Content-Type': 'multipart/form-data; boundary=' + boundary 
    },
    body: payload
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}
test();
