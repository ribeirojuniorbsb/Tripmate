var CACHE = 'tripmate-v1';
var ASSETS = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(['./','./index.html']).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // nao interceptar chamadas ao Supabase ou Google
  var url = e.request.url;
  if(url.indexOf('supabase.co') !== -1 ||
     url.indexOf('googleapis.com') !== -1 ||
     url.indexOf('anthropic.com') !== -1){
    return;
  }

  e.respondWith(
    fetch(e.request).then(function(res){
      var clone = res.clone();
      caches.open(CACHE).then(function(cache){
        cache.put(e.request, clone);
      });
      return res;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
