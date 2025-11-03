$regpath = "C:\Users\MCL\3D Objects\mgnrega_portal\frontend\js\register-sw.js"
@"
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/sw.js')
    .then(() => console.log('SW registered'))
    .catch(console.warn);
}
"@ | Out-File -FilePath $regpath -Encoding UTF8
