# Run after each deploy:  powershell -ExecutionPolicy Bypass -File .\submit-indexnow.ps1
$body = @{
 host = 'lumvik-solutions.vercel.app'
 key = '0e78dd52f1e5af8ab2a8e29191a98a0d'
 keyLocation = 'https://lumvik-solutions.vercel.app/0e78dd52f1e5af8ab2a8e29191a98a0d.txt'
 urlList = @(
  'https://lumvik-solutions.vercel.app/',
  'https://lumvik-solutions.vercel.app/about.html',
  'https://lumvik-solutions.vercel.app/agencies.html',
  'https://lumvik-solutions.vercel.app/answers.html',
  'https://lumvik-solutions.vercel.app/business-websites.html',
  'https://lumvik-solutions.vercel.app/contact.html',
  'https://lumvik-solutions.vercel.app/estimator.html',
  'https://lumvik-solutions.vercel.app/guide-briefing.html',
  'https://lumvik-solutions.vercel.app/guide-launch-checklist.html',
  'https://lumvik-solutions.vercel.app/guide-offshore.html',
  'https://lumvik-solutions.vercel.app/guides.html',
  'https://lumvik-solutions.vercel.app/landing-pages.html',
  'https://lumvik-solutions.vercel.app/overflow-support.html',
  'https://lumvik-solutions.vercel.app/pricing.html',
  'https://lumvik-solutions.vercel.app/privacy.html',
  'https://lumvik-solutions.vercel.app/redesigns.html',
  'https://lumvik-solutions.vercel.app/services.html',
  'https://lumvik-solutions.vercel.app/terms.html',
  'https://lumvik-solutions.vercel.app/work-northpeak.html',
  'https://lumvik-solutions.vercel.app/work-slidezza.html',
  'https://lumvik-solutions.vercel.app/work.html',
  'https://lumvik-solutions.vercel.app/llms.txt'
 )
} | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Uri 'https://api.indexnow.org/indexnow' -Method Post -ContentType 'application/json; charset=utf-8' -Body $body | Select-Object StatusCode
