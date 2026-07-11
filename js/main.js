  var reducedMotionGlobal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ---- Splash ----
  var splash = document.getElementById('splash');
  var skipSplash = document.getElementById('skipSplash');
  function dismissSplash(){
    if(splash){ splash.classList.add('hide'); }
  }
  if(splash){
    if(reducedMotionGlobal){ dismissSplash(); }
    else {
      setTimeout(dismissSplash, 2200);
      if(skipSplash){ skipSplash.addEventListener('click', dismissSplash); }
    }
  }

  // ---- Nav scroll state + mobile menu ----
  var nav = document.getElementById('nav');
  var mobileMenu = document.getElementById('mobile-menu');
  var burgerBtn = document.getElementById('burgerBtn');
  if(burgerBtn && mobileMenu){
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.addEventListener('click', function(){
      var isOpen = mobileMenu.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        mobileMenu.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Scroll: nav border + signature wave fill ----
  var fill = document.getElementById('current-fill');
  var dot = document.getElementById('current-dot');
  function onScroll(){
    if(nav){ nav.classList.toggle('scrolled', window.scrollY > 8); }
    var doc = document.documentElement;
    var scrollRange = Math.max(1, doc.scrollHeight - window.innerHeight);
    var pct = window.scrollY / scrollRange;
    pct = Math.max(0, Math.min(1, pct));
    if(fill){ fill.style.height = (pct*100) + '%'; }
    if(dot){ dot.style.top = (pct*100) + '%'; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // ---- Reveal on scroll ----
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, {threshold:0.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });
  }

  // ---- How it works toggle ----
  var toggleBn = document.getElementById('toggle-bn');
  var toggleTr = document.getElementById('toggle-tr');
  var flowBn = document.querySelector('.bn-flow');
  var flowTr = document.querySelector('.tr-flow');
  if(toggleBn && toggleTr && flowBn && flowTr){
    toggleBn.addEventListener('click', function(){
      toggleBn.classList.add('active','bn-active'); toggleTr.classList.remove('active','tr-active');
      flowBn.classList.add('active'); flowTr.classList.remove('active');
    });
    toggleTr.addEventListener('click', function(){
      toggleTr.classList.add('active','tr-active'); toggleBn.classList.remove('active','bn-active');
      flowTr.classList.add('active'); flowBn.classList.remove('active');
    });
  }

  // ---- Early access forms ----
  function setFormStatus(form, message, state){
    var status = form.querySelector('.form-status');
    if(!status) return;
    status.textContent = message || '';
    status.classList.remove('success', 'error');
    if(state){ status.classList.add(state); }
  }

  function setFormLoading(form, isLoading){
    var submit = form.querySelector('.form-submit');
    if(submit){
      if(!submit.getAttribute('data-idle-text')){
        submit.setAttribute('data-idle-text', submit.textContent);
      }
      submit.disabled = isLoading;
      submit.textContent = isLoading ? 'Sending...' : submit.getAttribute('data-idle-text');
    }
    form.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  }

  document.querySelectorAll('[data-product-focus]').forEach(function(link){
    link.addEventListener('click', function(){
      var targetId = link.getAttribute('href');
      var target = targetId ? document.querySelector(targetId) : null;
      if(!target) return;
      window.setTimeout(function(){
        var firstInput = target.querySelector('input[name="name"]');
        if(firstInput){ firstInput.focus({preventScroll:true}); }
      }, 450);
    });
  });

  document.querySelectorAll('.early-access-form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      setFormStatus(form, '', '');

      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }

      if(window.location.protocol === 'file:'){
        setFormStatus(form, 'Run the site with npm run dev or deploy it before submitting.', 'error');
        return;
      }

      var payload = {};
      new FormData(form).forEach(function(value, key){
        payload[key] = String(value).trim();
      });

      setFormLoading(form, true);
      fetch(form.getAttribute('action') || '/api/early-access', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(data){
          if(!response.ok){
            throw new Error(data.message || 'The signup could not be sent yet.');
          }
          return data;
        });
      })
      .then(function(data){
        form.reset();
        setFormStatus(form, data.message || 'Thanks - you are on the early access list.', 'success');
      })
      .catch(function(error){
        setFormStatus(form, error.message || 'Something went wrong. Please try again shortly.', 'error');
      })
      .finally(function(){
        setFormLoading(form, false);
      });
    });
  });

  // ---- 3D hero wave (Three.js) ----
  function initHero3D(){
    var canvas = document.getElementById('hero-canvas');
    if(!canvas || typeof THREE === 'undefined') return;
    var container = document.getElementById('hero-visual');
    var w = container.clientWidth, h = container.clientHeight;
    if(w === 0 || h === 0) return;

    var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(46, w/h, 0.1, 100);
    camera.position.set(0, 2.6, 6.4);
    camera.lookAt(0, -0.1, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    var dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(3, 6, 4);
    scene.add(dl);
    var dl2 = new THREE.DirectionalLight(0x8467A8, 0.4);
    dl2.position.set(-4, 2, -3);
    scene.add(dl2);

    var group = new THREE.Group();
    group.rotation.x = -0.95;
    scene.add(group);

    var cols = 21, rows = 12;
    var spacing = 0.42;
    var bands = [
      {color:0x0E7A5C, from:0, to:7},
      {color:0xE8A83C, from:7, to:14},
      {color:0x8467A8, from:14, to:21}
    ];
    var geo = new THREE.IcosahedronGeometry(0.09, 0);
    var groupsData = [];

    bands.forEach(function(band){
      var count = (band.to - band.from) * rows;
      var mat = new THREE.MeshStandardMaterial({color:band.color, roughness:0.45, metalness:0.2});
      var mesh = new THREE.InstancedMesh(geo, mat, count);
      var positions = [];
      var idx = 0;
      for(var i=band.from;i<band.to;i++){
        for(var j=0;j<rows;j++){
          var x = (i - (cols-1)/2) * spacing;
          var z = (j - (rows-1)/2) * spacing;
          positions.push({x:x, z:z, idx:idx});
          idx++;
        }
      }
      group.add(mesh);
      groupsData.push({mesh:mesh, positions:positions});
    });

    var dummy = new THREE.Object3D();
    var clock = new THREE.Clock();

    function renderStatic(){
      groupsData.forEach(function(gd){
        gd.positions.forEach(function(p){
          dummy.position.set(p.x, 0, p.z);
          dummy.updateMatrix();
          gd.mesh.setMatrixAt(p.idx, dummy.matrix);
        });
        gd.mesh.instanceMatrix.needsUpdate = true;
      });
      renderer.render(scene, camera);
    }

    if(reducedMotionGlobal){
      renderStatic();
    } else {
      (function animate(){
        var t = clock.getElapsedTime();
        groupsData.forEach(function(gd){
          gd.positions.forEach(function(p){
            var y = Math.sin(p.x*1.3 + t*0.9) * 0.32 + Math.cos(p.z*1.1 + t*0.7) * 0.22;
            dummy.position.set(p.x, y, p.z);
            dummy.updateMatrix();
            gd.mesh.setMatrixAt(p.idx, dummy.matrix);
          });
          gd.mesh.instanceMatrix.needsUpdate = true;
        });
        group.rotation.y = Math.sin(t*0.15) * 0.22;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      })();
    }

    window.addEventListener('resize', function(){
      var w2 = container.clientWidth, h2 = container.clientHeight;
      if(w2 === 0 || h2 === 0) return;
      camera.aspect = w2/h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2, false);
      if(reducedMotionGlobal) renderStatic();
    });
  }
  initHero3D();

  // ---- 3D tilt interaction on select cards ----
  if(!reducedMotionGlobal && window.matchMedia('(hover: hover)').matches){
    document.querySelectorAll('.tilt-3d').forEach(function(el){
      var intensity = 8;
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x*intensity) + 'deg) rotateX(' + (-y*intensity) + 'deg) translateZ(6px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  }
