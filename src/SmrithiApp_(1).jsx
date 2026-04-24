import React, { useState, useEffect, useRef, useCallback } from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@200;300;400;500&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --cream:#F3EDE3;--cream-d:#EAE1D2;--cream-dd:#DDD4C2;
      --ink:#18150F;--ink-60:rgba(24,21,15,0.6);--ink-35:rgba(24,21,15,0.35);
      --sienna:#4E3420;--sienna-l:#6B4E35;--gold:#B8944A;--gold-l:#CBA96A;
      --border:rgba(78,52,32,0.16);
    }
    html{scroll-behavior:smooth}
    body{background:var(--cream);color:var(--ink);font-family:'Jost',sans-serif;font-weight:300;overflow-x:hidden;-webkit-font-smoothing:antialiased}

    .cur-dot{position:fixed;width:6px;height:6px;background:var(--sienna);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)}
    .cur-ring{position:fixed;width:28px;height:28px;border:1px solid var(--sienna);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all 0.22s ease;opacity:0.4}

    .grain::after{content:'';position:fixed;inset:-50%;width:200%;height:200%;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");opacity:0.025;pointer-events:none;z-index:9000;animation:grain 8s steps(10) infinite}
    @keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-3%,-4%)}20%{transform:translate(4%,2%)}30%{transform:translate(-2%,5%)}40%{transform:translate(3%,-3%)}50%{transform:translate(-4%,1%)}60%{transform:translate(2%,4%)}70%{transform:translate(-1%,-2%)}80%{transform:translate(5%,3%)}90%{transform:translate(-3%,2%)}}

    .reveal{opacity:0;transform:translateY(24px);transition:opacity 0.9s cubic-bezier(0.16,1,0.3,1),transform 0.9s cubic-bezier(0.16,1,0.3,1)}
    .reveal.in{opacity:1;transform:translateY(0)}
    .d1{transition-delay:0.1s}.d2{transition-delay:0.22s}.d3{transition-delay:0.34s}.d4{transition-delay:0.46s}.d5{transition-delay:0.58s}

    .nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:0 max(40px,5vw);height:68px;display:flex;align-items:center;justify-content:space-between;transition:background 0.4s,border-bottom 0.4s}
    .nav.solid{background:rgba(243,237,227,0.95);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
    .nav-logo{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:400;letter-spacing:0.04em;color:var(--sienna);text-transform:uppercase;cursor:pointer}
    .nav-links{display:flex;align-items:center;gap:2.2rem}
    .nav-link{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-60);background:none;border:none;cursor:pointer;font-family:'Jost',sans-serif;font-weight:300;transition:color 0.2s;padding:0}
    .nav-link:hover,.nav-link.active{color:var(--sienna)}
    .nav-cta{padding:9px 22px;border:1px solid var(--sienna);color:var(--sienna) !important;transition:background 0.2s,color 0.2s !important}
    .nav-cta:hover{background:var(--sienna) !important;color:var(--cream) !important}

    .btn-p{display:inline-block;padding:14px 36px;background:var(--sienna);color:var(--cream);font-family:'Jost',sans-serif;font-size:0.65rem;font-weight:400;letter-spacing:0.24em;text-transform:uppercase;border:1px solid var(--sienna);cursor:pointer;transition:background 0.22s,color 0.22s}
    .btn-p:hover{background:transparent;color:var(--sienna)}
    .btn-g{display:inline-block;padding:14px 36px;background:transparent;color:var(--sienna);font-family:'Jost',sans-serif;font-size:0.65rem;font-weight:400;letter-spacing:0.24em;text-transform:uppercase;border:1px solid var(--border);cursor:pointer;transition:border-color 0.22s}
    .btn-g:hover{border-color:var(--sienna)}

    .sec{padding:110px max(40px,5vw)}
    .sec-label{font-size:0.6rem;letter-spacing:0.38em;text-transform:uppercase;color:var(--sienna);margin-bottom:1.8rem;display:flex;align-items:center;gap:1rem}
    .sec-label::before{content:'';width:24px;height:1px;background:var(--sienna);opacity:0.5;flex-shrink:0}
    .sec-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,4.5vw,4.2rem);font-weight:300;line-height:1.1;color:var(--ink)}
    .sec-h em{font-style:italic;color:var(--sienna)}
    .divider{border:none;border-top:1px solid var(--border);margin:0}

    .ticker-wrap{overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:12px 0}
    .ticker{display:flex;white-space:nowrap;animation:ticker 36s linear infinite}
    .ticker-item{font-size:0.58rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--sienna);padding:0 2.5rem;opacity:0.5}
    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

    .hero{min-height:100vh;display:grid;place-items:center;padding:130px max(40px,5vw) 80px;position:relative;overflow:hidden}
    .hero-eyebrow{font-size:0.6rem;letter-spacing:0.42em;text-transform:uppercase;color:var(--sienna);margin-bottom:2.5rem;opacity:0;animation:fadeUp 1s 0.3s cubic-bezier(0.16,1,0.3,1) forwards}
    .hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,8vw,7.5rem);font-weight:300;line-height:1.03;color:var(--ink);margin-bottom:2rem;opacity:0;animation:fadeUp 1.1s 0.5s cubic-bezier(0.16,1,0.3,1) forwards}
    .hero-title em{font-style:italic;color:var(--sienna)}
    .hero-sub{font-size:0.97rem;line-height:1.9;max-width:480px;margin:0 auto 3.5rem;color:var(--ink-60);opacity:0;animation:fadeUp 1.1s 0.7s cubic-bezier(0.16,1,0.3,1) forwards;text-align:center}
    .hero-btns{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;opacity:0;animation:fadeUp 1.1s 0.9s cubic-bezier(0.16,1,0.3,1) forwards}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

    .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:7vw;align-items:start;margin-top:3rem}
    @media(max-width:760px){.about-grid{grid-template-columns:1fr;gap:3rem}}
    .about-body{font-size:0.97rem;line-height:2;color:var(--ink-60);display:flex;flex-direction:column;gap:1.5rem}
    .pull-quote{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,2.4vw,2rem);font-style:italic;font-weight:300;line-height:1.5;color:var(--sienna);border-left:1px solid var(--gold);padding-left:1.8rem;margin-top:2.5rem}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border);margin-top:5rem}
    .stat{padding:2.8rem 0;border-right:1px solid var(--border)}
    .stat:last-child{border-right:none}.stat:not(:first-child){padding-left:2rem}
    .stat-n{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:300;color:var(--sienna);line-height:1;margin-bottom:0.4rem}
    .stat-d{font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-35)}

    .proc-wrap{background:var(--sienna);margin:0 -5vw;padding:110px 5vw}
    .proc-h{color:var(--cream)}.proc-h em{color:var(--gold)}
    .steps{display:grid;border-top:1px solid rgba(243,237,227,0.1);margin-top:4rem;gap:0}
    @media(max-width:760px){.steps{grid-template-columns:1fr !important}}
    .step{padding:2.8rem 2.5rem 2.8rem 0;border-right:1px solid rgba(243,237,227,0.08)}
    .step:last-child{border-right:none}.step:not(:first-child){padding-left:2.5rem}
    @media(max-width:760px){.step{padding:2rem 0;border-right:none;border-bottom:1px solid rgba(243,237,227,0.08)}}
    .step-n{font-family:'Cormorant Garamond',serif;font-size:4rem;font-weight:300;color:rgba(243,237,227,0.08);line-height:1;margin-bottom:1.2rem}
    .step-t{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:300;color:var(--cream);margin-bottom:0.7rem}
    .step-d{font-size:0.85rem;line-height:1.9;color:rgba(243,237,227,0.5)}

    .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5px;margin-top:4rem}
    @media(max-width:900px){.gallery-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:560px){.gallery-grid{grid-template-columns:1fr}}
    .gallery-item{aspect-ratio:3/4;position:relative;overflow:hidden;cursor:pointer}
    .gallery-item:nth-child(4n+1){grid-row:span 2;aspect-ratio:auto}
    .gallery-item:hover .gallery-ph{transform:scale(1.04)}
    .gallery-ph{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1)}
    .gallery-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(24,21,15,0.72) 0%,transparent 55%);opacity:0;transition:opacity 0.3s;display:flex;align-items:flex-end;padding:1.5rem}
    .gallery-item:hover .gallery-overlay{opacity:1}
    .gallery-caption{color:var(--cream);font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:300;font-style:italic}
    .gallery-sub{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(243,237,227,0.55);margin-top:0.3rem}

    .faq-wrap{max-width:760px;margin:4rem auto 0}
    .faq-item{border-bottom:1px solid var(--border)}
    .faq-item:first-child{border-top:1px solid var(--border)}
    .faq-q{width:100%;text-align:left;padding:1.8rem 0;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;font-family:'Cormorant Garamond',serif;font-size:1.25rem;font-weight:400;color:var(--ink)}
    .faq-icon{width:18px;height:18px;flex-shrink:0;position:relative}
    .faq-icon::before,.faq-icon::after{content:'';position:absolute;top:50%;left:50%;background:var(--sienna);transition:transform 0.3s}
    .faq-icon::before{width:12px;height:1px;transform:translate(-50%,-50%)}
    .faq-icon::after{width:1px;height:12px;transform:translate(-50%,-50%)}
    .faq-item.open .faq-icon::after{transform:translate(-50%,-50%) rotate(90deg)}
    .faq-a{overflow:hidden;max-height:0;transition:max-height 0.4s cubic-bezier(0.16,1,0.3,1)}
    .faq-item.open .faq-a{max-height:400px}
    .faq-a-inner{padding:0 0 1.8rem;font-size:0.92rem;line-height:1.95;color:var(--ink-60)}

    .upload-page{min-height:100vh;padding:120px max(40px,5vw) 80px;max-width:860px;margin:0 auto}
    .upload-steps{display:flex;align-items:center;margin-bottom:5rem}
    .u-step{display:flex;align-items:center;gap:0.8rem}
    .u-step-num{width:26px;height:26px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:var(--ink-35);transition:all 0.3s;flex-shrink:0}
    .u-step.active .u-step-num,.u-step.done .u-step-num{background:var(--sienna);border-color:var(--sienna);color:var(--cream)}
    .u-step-label{font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-35);transition:color 0.3s}
    .u-step.active .u-step-label{color:var(--ink)}
    .u-step-line{flex:1;height:1px;background:var(--border);min-width:24px}
    .upload-zone{border:1px dashed var(--border);padding:4rem 2rem;text-align:center;cursor:pointer;transition:border-color 0.25s,background 0.25s;position:relative;margin-bottom:2rem}
    .upload-zone:hover,.upload-zone.drag{border-color:var(--sienna);background:rgba(78,52,32,0.02)}
    .upload-zone-icon{font-family:'Cormorant Garamond',serif;font-size:2.5rem;color:var(--sienna);opacity:0.22;margin-bottom:1rem}
    .upload-zone-text{font-size:0.88rem;color:var(--ink-60);margin-bottom:0.5rem}
    .upload-zone-sub{font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-35)}
    .upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
    .photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:5px;margin-bottom:2rem}
    .photo-thumb{aspect-ratio:1;position:relative;overflow:hidden}
    .photo-thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .photo-remove{position:absolute;top:4px;right:4px;width:18px;height:18px;background:rgba(24,21,15,0.6);border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s}
    .photo-thumb:hover .photo-remove{opacity:1}
    .photo-remove::before,.photo-remove::after{content:'';position:absolute;width:8px;height:1px;background:white}
    .photo-remove::before{transform:rotate(45deg)}.photo-remove::after{transform:rotate(-45deg)}
    .photo-count-badge{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--sienna);margin-bottom:1.5rem}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem}
    @media(max-width:600px){.form-grid{grid-template-columns:1fr}}
    .form-full{grid-column:1/-1}
    .field{display:flex;flex-direction:column;gap:0.5rem}
    .field label{font-size:0.62rem;letter-spacing:0.24em;text-transform:uppercase;color:var(--ink-35)}
    .field input,.field textarea,.field select{background:transparent;border:none;border-bottom:1px solid var(--border);padding:0.7rem 0;font-family:'Jost',sans-serif;font-size:0.93rem;font-weight:300;color:var(--ink);outline:none;transition:border-color 0.2s;width:100%}
    .field input:focus,.field textarea:focus,.field select:focus{border-color:var(--sienna)}
    .field textarea{resize:vertical;min-height:90px}
    .field select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234E3420' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0 center;padding-right:1.5rem}
    .progress-bar-wrap{height:1px;background:var(--cream-dd);margin-bottom:3rem}
    .progress-bar-fill{height:100%;background:var(--sienna);transition:width 0.5s cubic-bezier(0.16,1,0.3,1)}
    .uploading-screen{text-align:center;padding:4rem 0}
    .upload-spinner{width:60px;height:60px;border:1px solid var(--border);border-top-color:var(--sienna);border-radius:50%;animation:spin 1.2s linear infinite;margin:0 auto 2.5rem}
    @keyframes spin{to{transform:rotate(360deg)}}
    .upload-progress-num{font-family:'Cormorant Garamond',serif;font-size:4rem;font-weight:300;color:var(--sienna);line-height:1;margin-bottom:0.5rem}
    .upload-status-text{font-size:0.75rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink-35)}
    .confirm-screen{text-align:center;padding:3rem 0}
    .confirm-icon{width:68px;height:68px;border:1px solid var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 2.5rem}
    .confirm-icon svg{width:26px;height:26px;stroke:var(--gold)}
    .confirm-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3.5rem);font-weight:300;color:var(--ink);margin-bottom:1rem}
    .confirm-h em{font-style:italic;color:var(--sienna)}
    .confirm-body{font-size:0.92rem;line-height:1.95;color:var(--ink-60);max-width:500px;margin:0 auto 3rem}
    .confirm-steps{display:flex;flex-direction:column;max-width:460px;margin:0 auto 3.5rem;text-align:left;border:1px solid var(--border)}
    .confirm-step{display:flex;align-items:flex-start;gap:1.5rem;padding:1.3rem 1.8rem;border-bottom:1px solid var(--border)}
    .confirm-step:last-child{border-bottom:none}
    .cs-num{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:300;color:var(--gold);flex-shrink:0;width:20px;padding-top:1px}
    .cs-text{font-size:0.83rem;line-height:1.65;color:var(--ink-60)}
    .cs-text strong{font-weight:400;color:var(--ink);display:block;margin-bottom:0.2rem}

    /* ── BOOK ── */
    .book-scene{perspective:1800px;width:100%;display:flex;justify-content:center;padding:2rem 0 1rem}
    .book-wrap{position:relative;width:min(280px,50vw);aspect-ratio:0.72/1;transform-style:preserve-3d;transform:rotateY(-20deg) rotateX(5deg) rotateZ(-1deg);transition:transform 0.7s cubic-bezier(0.16,1,0.3,1);filter:drop-shadow(6px 14px 40px rgba(24,21,15,0.35));cursor:pointer}
    .book-wrap:not(.open):hover{transform:rotateY(-10deg) rotateX(2deg) rotateZ(-0.5deg)}
    .book-wrap.open{transform:rotateY(0deg) rotateX(0deg) rotateZ(0deg);filter:drop-shadow(0px 8px 30px rgba(24,21,15,0.2));cursor:default}
    .book-pages-stack{position:absolute;top:3px;bottom:3px;right:-18px;width:18px;border-radius:0 1px 1px 0;background:linear-gradient(to right,var(--cream-dd) 0%,var(--cream) 50%,var(--cream-d) 100%);transform-origin:left center;transform:rotateY(90deg) translateZ(-1px);overflow:hidden}
    .book-pages-stack::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(to bottom,transparent 0px,transparent 3px,rgba(24,21,15,0.04) 3px,rgba(24,21,15,0.04) 4px)}
    .book-spine-face{position:absolute;top:3px;bottom:3px;left:-24px;width:24px;border-radius:2px 0 0 2px;transform-origin:right center;transform:rotateY(-90deg) translateZ(-1px);display:flex;align-items:center;justify-content:center;overflow:hidden}
    .book-spine-face::before{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(255,255,255,0.06) 0%,transparent 40%,rgba(0,0,0,0.18) 100%)}
    .book-spine-text{font-family:'Cormorant Garamond',serif;font-size:0.52rem;letter-spacing:0.35em;text-transform:uppercase;writing-mode:vertical-rl;transform:rotate(180deg);position:relative;z-index:1;opacity:0.55}
    .book-cover{position:absolute;inset:0;border-radius:1px 5px 5px 1px;overflow:hidden;backface-visibility:hidden;box-shadow:inset -1px 0 0 rgba(255,255,255,0.06),inset 1px 0 0 rgba(255,255,255,0.04)}
    .cover-texture{position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='lt'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65 0.55' numOctaves='3' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23lt)' opacity='0.4'/%3E%3C/svg%3E");opacity:0.35;mix-blend-mode:multiply}
    .cover-stitch{position:absolute;top:12px;bottom:12px;left:16px;width:1px;pointer-events:none}
    .cover-emboss-border{position:absolute;inset:16px;pointer-events:none}
    .cover-sheen{position:absolute;top:0;left:8%;right:45%;bottom:0;pointer-events:none}
    .cover-content{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:1.8rem 1.8rem 2rem;z-index:2}
    .cover-institution{position:absolute;top:1.6rem;left:1.8rem;right:1.8rem;display:flex;align-items:center;gap:0.7rem}
    .cover-institution-name{font-family:'Jost',sans-serif;font-size:0.48rem;font-weight:400;letter-spacing:0.45em;text-transform:uppercase}
    .cover-institution-line{flex:1;height:1px}
    .cover-series{font-size:0.5rem;font-weight:300;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:0.5rem}
    .cover-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,3vw,2.1rem);font-weight:300;line-height:1.08}
    .cover-year{font-size:0.56rem;letter-spacing:0.22em;text-transform:uppercase;margin-top:0.6rem}
    .cover-seal{position:absolute;bottom:1.6rem;right:1.6rem;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .corner-dot{position:absolute;width:4px;height:4px;border-radius:50%;pointer-events:none}
    .book-front-flap{position:absolute;inset:0;transform-origin:left center;transform-style:preserve-3d;transition:transform 1.15s cubic-bezier(0.77,0,0.175,1)}
    .book-wrap.open .book-front-flap{transform:rotateY(-172deg)}
    .cover-inside{position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;background:var(--cream-d);color:var(--ink)}
    .inside-rule{width:36px;height:1px;background:var(--gold);opacity:0.4;margin:0.7rem auto}
    .inside-title{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:300;font-style:italic;text-align:center;line-height:1.4;color:var(--ink)}
    .inside-sub{font-size:0.58rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--ink-35);text-align:center;margin-top:0.35rem}
    .inside-note{font-size:0.6rem;line-height:1.85;color:var(--ink-35);text-align:center;max-width:190px;margin-top:1rem}
    .book-right-page{position:absolute;inset:0;background:var(--cream-d);display:flex;flex-direction:column;padding:2rem;opacity:0;transition:opacity 0.4s 0.75s}
    .book-wrap.open .book-right-page{opacity:1}
    .right-page-num{font-size:0.55rem;letter-spacing:0.2em;text-align:right;color:var(--ink-35);margin-bottom:1.2rem;flex-shrink:0}
    .right-page-img{flex:1;min-height:0;overflow:hidden}
    .right-page-caption{font-family:'Cormorant Garamond',serif;font-size:0.8rem;font-style:italic;text-align:center;margin-top:0.7rem;color:var(--ink-60);flex-shrink:0}
    .open-prompt{text-align:center;margin-top:1.2rem}
    .open-prompt-btn{font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--sienna);background:none;border:none;cursor:pointer;opacity:0.55;transition:opacity 0.2s;display:inline-flex;align-items:center;gap:0.6rem;font-family:'Jost',sans-serif}
    .open-prompt-btn:hover{opacity:1}
    .open-prompt-btn svg{width:13px;height:13px;stroke:var(--sienna)}

    /* ── PAGE SPREAD ── */
    .page-area{position:relative;width:100%;aspect-ratio:2/1.35;margin-top:1.5rem;background:var(--cream-d);border:1px solid var(--border);overflow:hidden;display:flex;box-shadow:0 4px 20px rgba(24,21,15,0.06)}
    .page-left,.page-right{width:50%;position:relative;overflow:hidden;display:flex;flex-direction:column}
    .page-left{border-right:1px solid var(--border)}
    .page-content{padding:1.6rem;flex:1;display:flex;flex-direction:column}
    .page-num{font-size:0.58rem;letter-spacing:0.2em;color:var(--ink-35);margin-bottom:1rem;flex-shrink:0}
    .page-img{flex:1;overflow:hidden;position:relative}
    .page-caption{font-family:'Cormorant Garamond',serif;font-size:0.82rem;font-style:italic;color:var(--ink-60);margin-top:0.7rem;text-align:center;flex-shrink:0}
    .page-shadow-l{position:absolute;top:0;bottom:0;right:0;width:20px;background:linear-gradient(to right,rgba(24,21,15,0.05),transparent);pointer-events:none;z-index:1}
    .page-shadow-r{position:absolute;top:0;bottom:0;left:0;width:20px;background:linear-gradient(to left,rgba(24,21,15,0.05),transparent);pointer-events:none;z-index:1}
    .page-nav{display:flex;align-items:center;justify-content:center;gap:2rem;margin-top:1.2rem}
    .page-nav-btn{background:none;border:1px solid var(--border);width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color 0.2s}
    .page-nav-btn:hover{border-color:var(--sienna)}
    .page-nav-btn svg{width:12px;height:12px;stroke:var(--sienna)}
    .page-indicator{font-size:0.62rem;letter-spacing:0.14em;color:var(--ink-35)}

    /* ── PREVIEW CONTROLS ── */
    .preview-layout{display:grid;grid-template-columns:1fr 300px;gap:4rem;align-items:start;margin-top:4rem}
    @media(max-width:960px){.preview-layout{grid-template-columns:1fr;gap:3rem}}
    .controls-panel{display:flex;flex-direction:column;gap:2rem}
    .ctrl-group{display:flex;flex-direction:column;gap:0.7rem}
    .ctrl-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--sienna);margin-bottom:0.3rem}
    .color-swatches{display:flex;gap:0.5rem;flex-wrap:wrap}
    .swatch{width:30px;height:30px;border-radius:2px;cursor:pointer;border:2px solid transparent;transition:border-color 0.2s,transform 0.2s}
    .swatch:hover{transform:scale(1.08)}.swatch.selected{border-color:var(--gold)}
    .font-options{display:flex;flex-direction:column;gap:0.4rem}
    .font-opt{padding:0.65rem 1rem;border:1px solid var(--border);cursor:pointer;text-align:left;background:none;transition:border-color 0.2s,background 0.2s}
    .font-opt:hover{border-color:var(--sienna)}.font-opt.selected{border-color:var(--sienna);background:rgba(78,52,32,0.03)}
    .font-opt-name{font-size:0.68rem;color:var(--ink-60);margin-bottom:2px}
    .font-opt-preview{font-size:1.05rem;color:var(--ink);line-height:1.2}
    .layout-opts{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem}
    .layout-opt{aspect-ratio:4/3;border:1px solid var(--border);cursor:pointer;position:relative;overflow:hidden;transition:border-color 0.2s;padding:5px}
    .layout-opt:hover,.layout-opt.selected{border-color:var(--sienna)}
    .layout-opt.selected::after{content:'✓';position:absolute;top:3px;right:5px;font-size:0.6rem;color:var(--sienna)}
    .layout-mini{width:100%;height:100%;display:flex;flex-direction:column;gap:3px}
    .layout-mini-img{background:var(--cream-dd);flex:1}
    .layout-mini-text{background:var(--cream-dd);height:7px;opacity:0.5}
    .border-opts{display:flex;gap:0.4rem}
    .border-opt{flex:1;padding:0.55rem 0;text-align:center;border:1px solid var(--border);cursor:pointer;font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-35);transition:all 0.2s}
    .border-opt:hover,.border-opt.selected{border-color:var(--sienna);color:var(--sienna)}
    .view-toggle{display:flex;gap:0.4rem;margin-bottom:2rem}
    .view-btn{padding:9px 20px;font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;font-family:'Jost',sans-serif;font-weight:300;transition:all 0.2s;border:1px solid var(--border);background:transparent;color:var(--ink-60)}
    .view-btn.active{background:var(--sienna);color:var(--cream);border-color:var(--sienna)}

    .cta-sec{text-align:center;padding:130px max(40px,5vw);position:relative;overflow:hidden}
    .cta-circ{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:1px solid var(--border);border-radius:50%;pointer-events:none}
    .cta-h{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,8vw,6.5rem);font-weight:300;line-height:1.06;position:relative;z-index:2}
    .cta-h em{font-style:italic;color:var(--sienna)}
    .cta-sub{font-size:0.9rem;color:var(--ink-60);max-width:420px;margin:1.5rem auto 3.5rem;line-height:1.9;position:relative;z-index:2}
    .cta-btns{display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;position:relative;z-index:2}

    .footer{border-top:1px solid var(--border);padding:2.5rem max(40px,5vw);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1.5rem}
    .footer-logo{font-family:'Cormorant Garamond',serif;font-size:1rem;letter-spacing:0.34em;text-transform:uppercase;color:var(--sienna)}
    .footer-links{display:flex;gap:2rem;list-style:none}
    .footer-links button{font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-35);background:none;border:none;cursor:pointer;transition:color 0.2s;font-family:'Jost',sans-serif}
    .footer-links button:hover{color:var(--sienna)}
    .footer-copy{font-size:0.62rem;letter-spacing:0.1em;color:var(--ink-35)}
  `}</style>
);

function useInView(opts) {
  var options = opts || {};
  var ref = useRef(null);
  var _s = useState(false);
  var vis = _s[0];
  var setVis = _s[1];
  useEffect(function() {
    var o = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { setVis(true); o.disconnect(); }
    }, Object.assign({ threshold: 0.1 }, options));
    if (ref.current) o.observe(ref.current);
    return function() { o.disconnect(); };
  }, []);
  return [ref, vis];
}

function Cursor() {
  var dot = useRef(null);
  var ring = useRef(null);
  useEffect(function() {
    var mx = 0, my = 0, rx = 0, ry = 0;
    function mv(e) { mx = e.clientX; my = e.clientY; }
    window.addEventListener("mousemove", mv);
    function lp() {
      if (dot.current) { dot.current.style.left = mx + "px"; dot.current.style.top = my + "px"; }
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
      if (ring.current) { ring.current.style.left = rx + "px"; ring.current.style.top = ry + "px"; }
      requestAnimationFrame(lp);
    }
    requestAnimationFrame(lp);
    return function() { window.removeEventListener("mousemove", mv); };
  }, []);
  return (
    <div>
      <div ref={dot} className="cur-dot" />
      <div ref={ring} className="cur-ring" />
    </div>
  );
}

function Navigation({ page, setPage }) {
  var _s = useState(false);
  var scrolled = _s[0];
  var setScrolled = _s[1];
  useEffect(function() {
    function h() { setScrolled(window.scrollY > 40); }
    window.addEventListener("scroll", h);
    return function() { window.removeEventListener("scroll", h); };
  }, []);
  return (
    <nav className={scrolled ? "nav solid" : "nav"}>
      <div className="nav-logo" onClick={function() { setPage("home"); }}>Smrithi</div>
      <div className="nav-links">
        {[["Gallery","gallery"],["Process","process"],["FAQ","faq"]].map(function(item) {
          return (
            <button key={item[1]} className={page === item[1] ? "nav-link active" : "nav-link"} onClick={function() { setPage(item[1]); }}>{item[0]}</button>
          );
        })}
        <button className="nav-link nav-cta" onClick={function() { setPage("upload"); }}>Begin</button>
      </div>
    </nav>
  );
}

function Hero({ setPage }) {
  var ticker = ["320gsm Archival Stock","Smyth-Sewn Binding","Acid-Free Construction","Blind-Embossed Cover","One Edition Per Journey","Permanent Physical Record"];
  var doubled = ticker.concat(ticker);
  return (
    <div>
      <section className="hero">
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          {[{w:"140vw",h:"70vw",b:"-22%",o:0.35},{w:"105vw",h:"52vw",b:"-10%",o:0.25},{w:"70vw",h:"35vw",b:"2%",o:0.15}].map(function(a, i) {
            return <div key={i} style={{position:"absolute",border:"1px solid var(--border)",borderRadius:"50%",left:"50%",transform:"translateX(-50%)",width:a.w,height:a.h,bottom:a.b,opacity:a.o,pointerEvents:"none"}} />;
          })}
        </div>
        <div style={{textAlign:"center",position:"relative",zIndex:2,maxWidth:"800px"}}>
          <p className="hero-eyebrow">Archival Travel Books · Made for Retirement</p>
          <h1 className="hero-title">Every trip, <em>bound.</em><br/>Every memory, kept.</h1>
          <p className="hero-sub">We transform your travel photographs into permanent archival albums — one book per journey, built to outlast everything digital.</p>
          <div className="hero-btns">
            <button className="btn-p" onClick={function() { setPage("upload"); }}>Begin Your Edition</button>
            <button className="btn-g" onClick={function() { setPage("preview"); }}>Preview the Book</button>
          </div>
        </div>
      </section>
      <div className="ticker-wrap">
        <div className="ticker">
          {doubled.map(function(t, i) { return <span key={i} className="ticker-item">◆ {t}</span>; })}
        </div>
      </div>
    </div>
  );
}

function About() {
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  return (
    <section className="sec" ref={ref} style={{borderTop:"1px solid var(--border)"}}>
      <div className={"sec-label reveal" + (vis ? " in" : "")}>What We Make</div>
      <div className="about-grid">
        <div>
          <h2 className={"sec-h reveal d1" + (vis ? " in" : "")}>Not an album.<br/>An <em>archive.</em></h2>
          <p className={"pull-quote reveal d2" + (vis ? " in" : "")}>"Each trip deserves its own volume. When you retire, you'll hold a shelf of journeys — every one of them real."</p>
        </div>
        <div className={"about-body reveal d2" + (vis ? " in" : "")}>
          <p>Send us your photographs from a trip. We design a bound edition — structured, sequenced, and printed on 320gsm archival matte stock. One book per journey.</p>
          <p>Over years and decades, your shelf fills up. Rome, 2019. Kyoto, 2022. Patagonia, 2025. When retirement comes, you don't open a photo app — you open a book.</p>
          <p>We build these to last generations. Smyth-sewn. Acid-free. Leatherette-bound. Blind-embossed with your trip title. Not a product. A permanent form.</p>
        </div>
      </div>
      <div className={"stats reveal d3" + (vis ? " in" : "")}>
        {[["320gsm","Archival matte stock"],["∞","Expected archival lifespan"],["01","Edition per trip, always"]].map(function(s) {
          return <div key={s[0]} className="stat"><div className="stat-n">{s[0]}</div><div className="stat-d">{s[1]}</div></div>;
        })}
      </div>
    </section>
  );
}

function ProcessSection() {
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  var steps = [
    {n:"01",t:"Upload",d:"Share your trip photos through our intake form. Add context — where you went, what it meant. We read every word."},
    {n:"02",t:"We Design",d:"Your photos are sequenced and laid out within a precise typographic grid. You receive a digital preview within a few hours."},
    {n:"03",t:"We Call You",d:"Before printing, we have a short conversation. We want to understand the significance of the trip. Then we print."},
    {n:"04",t:"Bound & Shipped",d:"Smyth-sewn, leatherette-covered, blind-embossed. Your edition ships within two weeks. Built for the shelf."},
  ];
  return (
    <div ref={ref} className="proc-wrap">
      <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.8rem"}}>
        <span style={{width:24,height:1,background:"rgba(243,237,227,0.4)",display:"inline-block"}} />
        <span style={{fontSize:"0.6rem",letterSpacing:"0.38em",textTransform:"uppercase",color:"rgba(243,237,227,0.4)"}}>How It Works</span>
      </div>
      <h2 className={"sec-h proc-h reveal d1" + (vis ? " in" : "")}>Craft you can <em>feel.</em></h2>
      <div className="steps" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {steps.map(function(s, i) {
          return (
            <div key={s.n} className={"step reveal d" + (i+2) + (vis ? " in" : "")}>
              <div className="step-n">{s.n}</div>
              <div className="step-t">{s.t}</div>
              <p className="step-d">{s.d}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

var GALLERY_ITEMS = [
  {dest:"Kyoto, Japan",year:"Spring 2023",photos:"127 photographs",color:"#7A6848"},
  {dest:"Patagonia",year:"Winter 2022",photos:"94 photographs",color:"#3E5E52"},
  {dest:"Santorini",year:"Summer 2023",photos:"108 photographs",color:"#4A6880"},
  {dest:"Rajasthan",year:"Autumn 2022",photos:"143 photographs",color:"#7A4A32"},
  {dest:"Scottish Highlands",year:"Spring 2022",photos:"89 photographs",color:"#4A5C3C"},
  {dest:"Marrakech",year:"Winter 2023",photos:"112 photographs",color:"#8A6A30"},
];

function GalleryPlaceholder(props) {
  var color = props.color; var dest = props.dest; var year = props.year; var tall = props.tall;
  return (
    <div style={{width:"100%",height:"100%",minHeight:tall?500:260,background:"linear-gradient(160deg,"+color+"18 0%,"+color+"38 100%)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"1.5rem",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:5,background:"linear-gradient(to bottom,"+color+"80,"+color+"40)"}} />
      <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",fontFamily:"'Cormorant Garamond',serif",fontSize:"4.5rem",fontWeight:300,color:color,opacity:0.07,whiteSpace:"nowrap",letterSpacing:"0.1em"}}>{dest.split(",")[0]}</div>
      <div style={{position:"absolute",top:"1.2rem",right:"1.2rem",width:36,height:48,background:color,opacity:0.16,borderRadius:"1px 3px 3px 1px"}} />
      <div style={{position:"relative",zIndex:2,paddingLeft:"0.5rem"}}>
        <div style={{fontSize:"0.56rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(24,21,15,0.32)",marginBottom:"0.4rem"}}>Archival Edition</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",fontStyle:"italic",color:"var(--ink)",marginBottom:"0.22rem"}}>{dest}</div>
        <div style={{fontSize:"0.58rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--ink-35)"}}>{year}</div>
      </div>
    </div>
  );
}

function GalleryPage({ setPage }) {
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  return (
    <div className="sec" style={{paddingTop:120}} ref={ref}>
      <div className={"sec-label reveal" + (vis ? " in" : "")}>Past Editions</div>
      <h2 className={"sec-h reveal d1" + (vis ? " in" : "")}>Journeys we've <em>bound.</em></h2>
      <p className={"reveal d2" + (vis ? " in" : "")} style={{fontSize:"0.92rem",color:"var(--ink-60)",maxWidth:480,marginTop:"1rem",lineHeight:1.95}}>Each album below is a real edition — a single trip, bound permanently. Your shelf could look like this.</p>
      <div className="gallery-grid">
        {GALLERY_ITEMS.map(function(g, i) {
          var tall = i === 0 || i === 3;
          return (
            <div key={i} className="gallery-item" style={tall ? {gridRow:"span 2"} : {}} onClick={function() { setPage("preview"); }}>
              <GalleryPlaceholder color={g.color} dest={g.dest} year={g.year} tall={tall} />
              <div className="gallery-overlay">
                <div>
                  <div className="gallery-caption">{g.dest}</div>
                  <div className="gallery-sub">{g.year} · {g.photos}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",marginTop:"4rem"}}>
        <button className="btn-p" onClick={function() { setPage("upload"); }}>Begin Your Edition</button>
      </div>
    </div>
  );
}

var FAQS = [
  {q:"How many photos should I submit?",a:"We work best with 80–200 photographs per trip. More gives us better selection for sequencing; we'll curate down to the most meaningful frames. You can submit up to 500 photos."},
  {q:"How long does it take to receive my album?",a:"You'll receive a digital preview within a few hours of submitting. After our call and your approval, the physical edition ships within 10–14 business days."},
  {q:"What size are the albums?",a:"Our standard edition is 30×24cm (landscape). We also offer a portrait 24×30cm edition. Both use the same archival materials and binding methods."},
  {q:"Can I add captions or written notes?",a:"Yes — and we encourage it. The intake form includes a field for trip notes, date ranges, and specific memories. These can be incorporated as captions or a brief introduction page."},
  {q:"What does the preview call involve?",a:"It's a 15–20 minute conversation where we walk through the digital layout together. We discuss what the trip meant, any sequencing adjustments, and cover customisations before going to print."},
  {q:"How durable are the albums?",a:"Each edition is Smyth-sewn with archival PVA adhesive. The 320gsm stock is acid-free and UV-resistant. Kept away from direct sunlight, your album should remain pristine for over a century."},
  {q:"Can I order multiple copies?",a:"Yes. Additional copies of the same edition are available at a reduced cost. Many customers order one to keep and one to gift."},
  {q:"What's your pricing?",a:"Editions start from ₹4,800 for a standard 40-page album. Pricing scales with page count. Final pricing is confirmed after the preview call once we know the scope of your edition."},
];

function FAQPage({ setPage }) {
  var _s = useState(null);
  var open = _s[0]; var setOpen = _s[1];
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  return (
    <div className="sec" style={{paddingTop:120}} ref={ref}>
      <div className={"sec-label reveal" + (vis ? " in" : "")}>Questions</div>
      <h2 className={"sec-h reveal d1" + (vis ? " in" : "")}>Everything you <em>need to know.</em></h2>
      <div className="faq-wrap">
        {FAQS.map(function(f, i) {
          return (
            <div key={i} className={open === i ? "faq-item open" : "faq-item"}>
              <button className="faq-q" onClick={function() { setOpen(open === i ? null : i); }}>
                {f.q}<span className="faq-icon" />
              </button>
              <div className="faq-a"><div className="faq-a-inner">{f.a}</div></div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",marginTop:"4rem"}}>
        <p style={{fontSize:"0.88rem",color:"var(--ink-60)",marginBottom:"1.5rem"}}>Still have questions? We'd love to talk.</p>
        <button className="btn-p" onClick={function() { setPage("upload"); }}>Begin Your Edition</button>
      </div>
    </div>
  );
}

function UploadPage({ setPage }) {
  var _s1 = useState(1); var step = _s1[0]; var setStep = _s1[1];
  var _s2 = useState([]); var photos = _s2[0]; var setPhotos = _s2[1];
  var _s3 = useState(false); var drag = _s3[0]; var setDrag = _s3[1];
  var _s4 = useState(0); var progress = _s4[0]; var setProgress = _s4[1];
  var _s5 = useState({dest:"",dates:"",travellers:"",significance:"",email:"",name:"",package:"standard"});
  var form = _s5[0]; var setForm = _s5[1];

  function addFiles(files) {
    var imgs = Array.from(files).filter(function(f) { return f.type.startsWith("image/"); });
    setPhotos(function(p) { return p.concat(imgs.map(function(f) { return {url:URL.createObjectURL(f),name:f.name}; })).slice(0,200); });
  }
  function startUpload() {
    setStep(3); var p = 0;
    var iv = setInterval(function() {
      p += Math.random()*3.5+1;
      if (p >= 100) { clearInterval(iv); setProgress(100); setTimeout(function() { setStep(4); }, 700); }
      else setProgress(Math.min(p, 99));
    }, 80);
  }
  var stepLabels = ["Photos","Details","Processing","Done"];
  return (
    <div className="upload-page">
      <div className="upload-steps">
        {stepLabels.map(function(l, i) {
          return (
            <div key={l} style={{display:"contents"}}>
              {i > 0 && <div className="u-step-line" />}
              <div className={"u-step" + (step===i+1?" active":step>i+1?" done":"")}>
                <div className="u-step-num">{step > i+1 ? "✓" : i+1}</div>
                <div className="u-step-label">{l}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{width:(step===1?25:step===2?50:step===3?75:100)+"%"}} />
      </div>

      {step === 1 && (
        <div>
          <div className="sec-label">Step 1 of 2</div>
          <h2 className="sec-h" style={{marginBottom:"2.5rem"}}>Upload your <em>photographs.</em></h2>
          {photos.length === 0 ? (
            <div className={"upload-zone" + (drag?" drag":"")}
              onDragOver={function(e){e.preventDefault();setDrag(true);}}
              onDragLeave={function(){setDrag(false);}}
              onDrop={function(e){e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files);}}>
              <input type="file" multiple accept="image/*" onChange={function(e){addFiles(e.target.files);}} />
              <div className="upload-zone-icon">↑</div>
              <p className="upload-zone-text">Drag your photos here, or click to browse</p>
              <p className="upload-zone-sub">JPEG · PNG · HEIC · Up to 200 photos</p>
            </div>
          ) : (
            <div>
              <div className="photo-count-badge">{photos.length} photo{photos.length!==1?"s":""} added</div>
              <div className="photo-grid">
                {photos.map(function(p, i) {
                  return (
                    <div key={i} className="photo-thumb">
                      <img src={p.url} alt={p.name} />
                      <button className="photo-remove" onClick={function(){setPhotos(function(ph){return ph.filter(function(_,j){return j!==i;});});}} />
                    </div>
                  );
                })}
                <div className={"upload-zone" + (drag?" drag":"")} style={{aspectRatio:"1",padding:"0.8rem",margin:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"auto"}}
                  onDragOver={function(e){e.preventDefault();setDrag(true);}}
                  onDragLeave={function(){setDrag(false);}}
                  onDrop={function(e){e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files);}}>
                  <input type="file" multiple accept="image/*" onChange={function(e){addFiles(e.target.files);}} />
                  <div style={{fontSize:"1.4rem",color:"var(--sienna)",opacity:0.28}}>+</div>
                  <div style={{fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--ink-35)",marginTop:"0.3rem"}}>Add more</div>
                </div>
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:"2rem"}}>
            <button className="btn-p" onClick={function(){setStep(2);}} disabled={photos.length===0} style={{opacity:photos.length===0?0.4:1}}>Next →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="sec-label">Step 2 of 2</div>
          <h2 className="sec-h" style={{marginBottom:"2.5rem"}}>Tell us about the <em>trip.</em></h2>
          <div className="form-grid">
            <div className="field"><label>Your Name</label><input placeholder="Arjun & Priya Mehta" value={form.name} onChange={function(e){setForm(function(f){return Object.assign({},f,{name:e.target.value});});}} /></div>
            <div className="field"><label>Your Email</label><input type="email" placeholder="you@email.com" value={form.email} onChange={function(e){setForm(function(f){return Object.assign({},f,{email:e.target.value});});}} /></div>
            <div className="field"><label>Where did you go?</label><input placeholder="Kyoto, Japan" value={form.dest} onChange={function(e){setForm(function(f){return Object.assign({},f,{dest:e.target.value});});}} /></div>
            <div className="field"><label>When?</label><input placeholder="March 14–28, 2024" value={form.dates} onChange={function(e){setForm(function(f){return Object.assign({},f,{dates:e.target.value});});}} /></div>
            <div className="field"><label>Who was there?</label><input placeholder="Just the two of us. 10th anniversary." value={form.travellers} onChange={function(e){setForm(function(f){return Object.assign({},f,{travellers:e.target.value});});}} /></div>
            <div className="field"><label>Album size</label>
              <select value={form.package} onChange={function(e){setForm(function(f){return Object.assign({},f,{package:e.target.value});});}}>
                <option value="standard">Standard — 40 pages</option>
                <option value="extended">Extended — 80 pages</option>
                <option value="archive">Archive — 120+ pages</option>
              </select>
            </div>
            <div className="field form-full"><label>What made this trip special?</label>
              <textarea placeholder="We'd been planning Kyoto for seven years. The cherry blossoms were at peak..." value={form.significance} onChange={function(e){setForm(function(f){return Object.assign({},f,{significance:e.target.value});});}} />
            </div>
          </div>
          <div style={{display:"flex",gap:"1rem",justifyContent:"flex-end",marginTop:"1rem"}}>
            <button className="btn-g" onClick={function(){setStep(1);}}>← Back</button>
            <button className="btn-p" onClick={startUpload} disabled={!form.name||!form.email||!form.dest} style={{opacity:(!form.name||!form.email||!form.dest)?0.4:1}}>Send for Preview →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="uploading-screen">
          <div className="upload-spinner" />
          <div className="upload-progress-num">{Math.round(progress)}%</div>
          <div className="upload-status-text">{progress<35?"Uploading photos…":progress<65?"Organising your album…":"Almost done…"}</div>
          <div style={{maxWidth:280,margin:"2rem auto 0"}}>
            <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:progress+"%"}} /></div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="confirm-screen">
          <div className="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="confirm-h">You're all <em>set.</em></h2>
          <p className="confirm-body">{form.name ? form.name+", we've" : "We've"} received your {photos.length} photos. Here's what happens next:</p>
          <div className="confirm-steps">
            <div className="confirm-step"><div className="cs-num">1</div><div className="cs-text"><strong>We send you a preview</strong>A full digital layout lands in {form.email||"your inbox"} within a few hours.</div></div>
            <div className="confirm-step"><div className="cs-num">2</div><div className="cs-text"><strong>We call you</strong>A quick 15–20 min call to walk through it together. We want to get this right.</div></div>
            <div className="confirm-step"><div className="cs-num">3</div><div className="cs-text"><strong>We ship your book</strong>Once you approve, your edition is printed, bound, and shipped within two weeks.</div></div>
          </div>
          <div style={{display:"flex",gap:"1.5rem",justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-g" onClick={function(){setPage("gallery");}}>See past albums</button>
            <button className="btn-p" onClick={function(){setPage("preview");}}>Preview the book</button>
          </div>
        </div>
      )}
    </div>
  );
}

var PAGE_PALETTES = [["#C4B49A","#A89478"],["#8AA49C","#6E8C84"],["#C0A498","#A48878"],["#B4C4AC","#98A890"],["#C8B8A4","#AC9C88"]];

function PageLayout({ layout, palette, side, borderStyle }) {
  var border = borderStyle==="None" ? "none" : borderStyle==="Gold" ? "1px solid rgba(184,148,74,0.45)" : "1px solid rgba(24,21,15,0.12)";
  var c1 = side==="left" ? palette[0] : palette[1];
  var c2 = side==="left" ? palette[1] : palette[0];
  var baseStyle = {position:"absolute",inset:0};
  if (layout === "full") {
    return <div style={Object.assign({},baseStyle,{background:"linear-gradient(135deg,"+c1+","+c2+")",border:border})} />;
  }
  if (layout === "margin") {
    return (
      <div style={Object.assign({},baseStyle,{padding:"8%"})}>
        <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,"+c1+","+c2+")",border:border}} />
      </div>
    );
  }
  if (layout === "grid") {
    return (
      <div style={Object.assign({},baseStyle,{display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:4})}>
        {[0,1,2,3].map(function(i) {
          return <div key={i} style={{background:"linear-gradient("+(120+i*35)+"deg,"+palette[i%2]+","+palette[(i+1)%2]+")",border:border}} />;
        })}
      </div>
    );
  }
  if (layout === "editorial") {
    return (
      <div style={Object.assign({},baseStyle,{display:"grid",gridTemplateRows:"2fr 1fr",gap:4})}>
        <div style={{background:"linear-gradient(135deg,"+c1+","+c2+")",border:border}} />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
          <div style={{background:"linear-gradient(45deg,"+c2+","+c1+")",border:border}} />
          <div style={{background:c1+"44",border:border,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.65rem",fontStyle:"italic",color:"var(--ink-35)",textAlign:"center",padding:"0.4rem"}}>a moment of stillness</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

var COVER_COLORS = [
  {name:"Espresso",hex:"#1E0E06",light:true},
  {name:"Cordovan",hex:"#4E3420",light:true},
  {name:"Slate",hex:"#263240",light:true},
  {name:"Forest",hex:"#1E3020",light:true},
  {name:"Cognac",hex:"#6E3E1C",light:true},
  {name:"Parchment",hex:"#D8CEB8",light:false},
];

function RealisticBook({ coverColor, fontStyle, borderStyle, tripName, currentPage, layout }) {
  var _s = useState(false); var isOpen = _s[0]; var setIsOpen = _s[1];
  var tl = coverColor.light;
  var textColor = tl ? "var(--cream)" : "var(--ink)";
  var subColor = tl ? "rgba(243,237,227,0.4)" : "rgba(24,21,15,0.38)";
  var instColor = tl ? "rgba(243,237,227,0.28)" : "rgba(24,21,15,0.26)";
  var stitchColor = tl ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)";
  var emboss = tl ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  var sheen = tl ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)";
  var sealColor = tl ? "rgba(184,148,74,0.55)" : "rgba(78,52,32,0.4)";
  var palette = PAGE_PALETTES[currentPage % PAGE_PALETTES.length];
  var fontMap = {
    cormorant: {fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontWeight:300},
    jost: {fontFamily:"'Jost',sans-serif",fontWeight:200,letterSpacing:"0.15em"},
    playfair: {fontFamily:"'Playfair Display',serif",fontStyle:"italic"},
  };
  var captions = ["Morning, the city waking","The harbour at last light","An afternoon in the old quarter","Steps ascending toward the summit","Final evening — departure"];
  return (
    <div>
      <div className="book-scene">
        <div className={"book-wrap" + (isOpen?" open":"")} onClick={function(){if(!isOpen)setIsOpen(true);}} style={{background:coverColor.hex}}>
          <div className="book-pages-stack" />
          <div className="book-spine-face" style={{background:"color-mix(in srgb,"+coverColor.hex+" 80%,black)"}}>
            <span className="book-spine-text" style={{color:subColor}}>Smrithi · {tripName||"Edition"}</span>
          </div>
          <div className="book-right-page">
            <div className="right-page-num">— {currentPage*2+2} —</div>
            <div className="right-page-img" style={{position:"relative"}}>
              <PageLayout layout={layout} palette={palette} side="right" borderStyle={borderStyle} />
            </div>
            <div className="right-page-caption">{captions[currentPage % captions.length]}</div>
          </div>
          <div className="book-front-flap">
            <div className="book-cover" style={{background:coverColor.hex}}>
              <div className="cover-texture" />
              <div className="cover-stitch" style={{background:"repeating-linear-gradient(to bottom,transparent 0px,transparent 4px,"+stitchColor+" 4px,"+stitchColor+" 8px)"}} />
              <div className="cover-emboss-border" style={{border:"1px solid "+emboss}} />
              <div className="cover-sheen" style={{background:"linear-gradient(108deg,transparent 28%,"+sheen+" 50%,transparent 72%)"}} />
              <div className="cover-institution" style={{color:instColor}}>
                <span className="cover-institution-name">Smrithi</span>
                <span className="cover-institution-line" style={{background:instColor}} />
              </div>
              <div className="cover-content" style={{color:textColor}}>
                <div className="cover-series" style={{color:subColor}}>Archival Travel Book</div>
                <div className="cover-title" style={fontMap[fontStyle]||fontMap.cormorant}>{tripName||"Kyoto, Japan"}</div>
                <div className="cover-year" style={{color:subColor}}>Spring 2024</div>
              </div>
              <div className="cover-seal" style={{border:"1px solid "+sealColor}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.88rem",color:sealColor}}>S</span>
              </div>
              {[[20,null,20,null],[20,null,null,20],[null,20,20,null],[null,20,null,20]].map(function(c,i) {
                return <div key={i} className="corner-dot" style={{top:c[0]||undefined,bottom:c[1]||undefined,left:c[2]||undefined,right:c[3]||undefined,border:"1px solid "+stitchColor}} />;
              })}
            </div>
            <div className="cover-inside">
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.56rem",letterSpacing:"0.38em",textTransform:"uppercase",color:"var(--ink-35)",marginBottom:"0.6rem"}}>Smrithi</div>
              <div className="inside-rule" />
              <div className="inside-title">{tripName||"Kyoto, Japan"}</div>
              <div className="inside-sub">Archival Travel Book · 2024</div>
              <div className="inside-rule" style={{marginTop:"0.6rem"}} />
              <div className="inside-note">One trip. One book. Built to last a hundred years.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="open-prompt">
        <button className="open-prompt-btn" onClick={function(){setIsOpen(function(o){return !o;});}}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            {isOpen
              ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              : <path d="M4 6h6v12H4zM14 6h6v12h-6z" strokeLinejoin="round" />
            }
          </svg>
          {isOpen ? "Close the book" : "Open the book"}
        </button>
      </div>
    </div>
  );
}

function PageSpread({ layout, borderStyle, currentPage }) {
  var palette = PAGE_PALETTES[currentPage % PAGE_PALETTES.length];
  var captions = [
    ["First light over the valley","The morning market"],
    ["Through the old city gate","Afternoon, the river"],
    ["The courtyard at noon","Steps ascending"],
    ["A table set for one","The last street"],
    ["Returning, the harbour","Departure platform"],
  ];
  var pair = captions[currentPage % captions.length];
  return (
    <div className="page-area">
      <div className="page-left">
        <div className="page-shadow-l" />
        <div className="page-content">
          <div className="page-num">— {currentPage*2+1} —</div>
          <div className="page-img">
            <PageLayout layout={layout} palette={palette} side="left" borderStyle={borderStyle} />
          </div>
          <div className="page-caption">{pair[0]}</div>
        </div>
      </div>
      <div className="page-right">
        <div className="page-shadow-r" />
        <div className="page-content">
          <div className="page-num" style={{textAlign:"right"}}>— {currentPage*2+2} —</div>
          <div className="page-img">
            <PageLayout layout={layout} palette={palette} side="right" borderStyle={borderStyle} />
          </div>
          <div className="page-caption" style={{textAlign:"right"}}>{pair[1]}</div>
        </div>
      </div>
    </div>
  );
}

var BORDER_STYLES = ["None","Thin","Double","Gold"];
var FONT_OPTIONS = [
  {id:"cormorant",name:"Cormorant Garamond",preview:"Kyoto",style:{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontWeight:300}},
  {id:"jost",name:"Jost Light",preview:"Kyoto",style:{fontFamily:"'Jost',sans-serif",fontWeight:200,letterSpacing:"0.15em"}},
  {id:"playfair",name:"Playfair Display",preview:"Kyoto",style:{fontFamily:"'Playfair Display',serif",fontStyle:"italic"}},
];
var LAYOUT_OPTIONS = [
  {id:"full",label:"Full Bleed"},{id:"margin",label:"Margined"},
  {id:"grid",label:"Grid"},{id:"editorial",label:"Editorial"},
];

function PreviewPage({ setPage }) {
  var _s1 = useState(1); var coverColorId = _s1[0]; var setCoverColorId = _s1[1];
  var _s2 = useState("None"); var borderStyle = _s2[0]; var setBorderStyle = _s2[1];
  var _s3 = useState("cormorant"); var fontOpt = _s3[0]; var setFontOpt = _s3[1];
  var _s4 = useState("full"); var layout = _s4[0]; var setLayout = _s4[1];
  var _s5 = useState(0); var currentPage = _s5[0]; var setCurrentPage = _s5[1];
  var _s6 = useState("Kyoto, Japan"); var tripName = _s6[0]; var setTripName = _s6[1];
  var _s7 = useState("cover"); var view = _s7[0]; var setView = _s7[1];
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  var coverColor = COVER_COLORS[coverColorId];
  return (
    <div className="sec" style={{paddingTop:110}} ref={ref}>
      <div className={"sec-label reveal" + (vis?" in":"")}>Preview Engine</div>
      <h2 className={"sec-h reveal d1" + (vis?" in":"")}>Your book, <em>before it's made.</em></h2>
      <p className={"reveal d2" + (vis?" in":"")} style={{fontSize:"0.9rem",color:"var(--ink-60)",maxWidth:480,marginTop:"1rem",lineHeight:1.95,marginBottom:"2rem"}}>Customise the cover colour, typeface, and layout below. These preferences carry through to your actual edition.</p>
      <div className="view-toggle">
        {["cover","pages"].map(function(v) {
          return <button key={v} className={"view-btn"+(view===v?" active":"")} onClick={function(){setView(v);}}>{v==="cover"?"Book Cover":"Interior Pages"}</button>;
        })}
      </div>
      <div className="preview-layout">
        <div>
          {view === "cover" ? (
            <RealisticBook coverColor={coverColor} fontStyle={fontOpt} borderStyle={borderStyle} tripName={tripName} currentPage={currentPage} layout={layout} />
          ) : (
            <div>
              <PageSpread layout={layout} borderStyle={borderStyle} currentPage={currentPage} />
              <div className="page-nav">
                <button className="page-nav-btn" onClick={function(){setCurrentPage(function(p){return Math.max(0,p-1);});}} disabled={currentPage===0}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className="page-indicator">Spread {currentPage+1} of 5</span>
                <button className="page-nav-btn" onClick={function(){setCurrentPage(function(p){return Math.min(4,p+1);});}} disabled={currentPage===4}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="controls-panel">
          <div className="ctrl-group">
            <div className="ctrl-label">Trip Title</div>
            <div className="field"><input value={tripName} onChange={function(e){setTripName(e.target.value);}} placeholder="Destination or journey name" /></div>
          </div>
          <div className="ctrl-group">
            <div className="ctrl-label">Cover — {coverColor.name}</div>
            <div className="color-swatches">
              {COVER_COLORS.map(function(c, i) {
                return <div key={i} className={"swatch"+(coverColorId===i?" selected":"")} style={{background:c.hex,outline:c.hex==="#D8CEB8"?"1px solid var(--border)":"none"}} onClick={function(){setCoverColorId(i);}} title={c.name} />;
              })}
            </div>
          </div>
          <div className="ctrl-group">
            <div className="ctrl-label">Typeface</div>
            <div className="font-options">
              {FONT_OPTIONS.map(function(f) {
                return (
                  <button key={f.id} className={"font-opt"+(fontOpt===f.id?" selected":"")} onClick={function(){setFontOpt(f.id);}}>
                    <div className="font-opt-name">{f.name}</div>
                    <div className="font-opt-preview" style={f.style}>{f.preview}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="ctrl-group">
            <div className="ctrl-label">Page Border</div>
            <div className="border-opts">
              {BORDER_STYLES.map(function(b) {
                return <button key={b} className={"border-opt"+(borderStyle===b?" selected":"")} onClick={function(){setBorderStyle(b);}}>{b}</button>;
              })}
            </div>
          </div>
          <div className="ctrl-group">
            <div className="ctrl-label">Layout</div>
            <div className="layout-opts">
              {LAYOUT_OPTIONS.map(function(l) {
                return (
                  <div key={l.id} className={"layout-opt"+(layout===l.id?" selected":"")} onClick={function(){setLayout(l.id);}}>
                    <div className="layout-mini">
                      {l.id==="full" && <div><div className="layout-mini-img" style={{height:"70%"}} /><div className="layout-mini-text" style={{height:"12%",marginTop:3}} /></div>}
                      {l.id==="margin" && <div style={{padding:4,height:"100%",display:"flex",flexDirection:"column",gap:3}}><div className="layout-mini-img" style={{flex:1}} /><div className="layout-mini-text" /></div>}
                      {l.id==="grid" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:3,height:"100%"}}><div className="layout-mini-img" /><div className="layout-mini-img" /><div className="layout-mini-img" /><div className="layout-mini-img" /></div>}
                      {l.id==="editorial" && <div style={{display:"grid",gridTemplateRows:"2fr 1fr",gap:3,height:"100%"}}><div className="layout-mini-img" /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}><div className="layout-mini-img" /><div className="layout-mini-img" /></div></div>}
                    </div>
                    <div style={{fontSize:"0.52rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--ink-35)",textAlign:"center",marginTop:4}}>{l.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="btn-p" style={{width:"100%"}} onClick={function(){setPage("upload");}}>Begin With These Settings</button>
          <p style={{fontSize:"0.62rem",color:"var(--ink-35)",textAlign:"center",letterSpacing:"0.1em",lineHeight:1.65}}>Your preferences carry through when you submit</p>
        </div>
      </div>
    </div>
  );
}

function ProcessPage({ setPage }) {
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  var steps = [
    {n:"01",t:"Upload",d:"Share your trip photos through our intake form. Add some context — where you went, who was there, what it meant. We read every word."},
    {n:"02",t:"We Design",d:"Your photos are sequenced and laid out in a precise typographic grid. You receive a full digital preview within a few hours of uploading."},
    {n:"03",t:"We Call You",d:"Before anything goes to print, we have a short conversation. We want to understand the significance of the trip. Then we make the book."},
    {n:"04",t:"Bound & Shipped",d:"Smyth-sewn, leatherette-covered, blind-embossed. Your edition ships within two weeks of approval. Built to sit on a shelf for a hundred years."},
  ];
  var specs = [
    ["Paper Stock","320gsm archival matte, acid-free and UV-resistant. The same spec used in conservation printing."],
    ["Binding","Smyth-sewn — the gold standard for books that need to last. Lays completely flat when open."],
    ["Cover","Leatherette over boards, with your trip title blind-embossed. Six colours to choose from."],
    ["Timeline","Digital preview in hours. Printed and shipped within two weeks of your approval."],
  ];
  return (
    <div className="sec" style={{paddingTop:120}} ref={ref}>
      <div className={"sec-label reveal" + (vis?" in":"")}>How It Works</div>
      <h2 className={"sec-h reveal d1" + (vis?" in":"")}>Craft you can <em>feel.</em></h2>
      <p className={"reveal d2" + (vis?" in":"")} style={{fontSize:"0.93rem",color:"var(--ink-60)",maxWidth:520,marginTop:"1rem",marginBottom:"4rem",lineHeight:1.95}}>Every book we make follows the same four steps. It's a slow, careful process — because that's the only way to do it right.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4rem 6vw",maxWidth:900}}>
        {steps.map(function(s, i) {
          return (
            <div key={i} className={"reveal d"+(i+1)+(vis?" in":"")}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:300,color:"rgba(78,52,32,0.1)",lineHeight:1,marginBottom:"1rem"}}>{s.n}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.45rem",fontWeight:300,color:"var(--ink)",marginBottom:"0.65rem"}}>{s.t}</div>
              <p style={{fontSize:"0.9rem",lineHeight:1.95,color:"var(--ink-60)"}}>{s.d}</p>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:"5rem",borderTop:"1px solid var(--border)",paddingTop:"4rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",maxWidth:700}}>
        {specs.map(function(s) {
          return (
            <div key={s[0]} style={{borderLeft:"1px solid var(--border)",paddingLeft:"1.5rem"}}>
              <div style={{fontSize:"0.6rem",letterSpacing:"0.28em",textTransform:"uppercase",color:"var(--sienna)",marginBottom:"0.5rem"}}>{s[0]}</div>
              <p style={{fontSize:"0.87rem",lineHeight:1.88,color:"var(--ink-60)"}}>{s[1]}</p>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",marginTop:"5rem"}}>
        <button className="btn-p" onClick={function(){setPage("upload");}}>Begin Your Edition</button>
      </div>
    </div>
  );
}

function FinalCTA({ setPage }) {
  var _iv = useInView();
  var ref = _iv[0]; var vis = _iv[1];
  return (
    <div ref={ref} className="cta-sec">
      {[220,380,560,740].map(function(s) { return <div key={s} className="cta-circ" style={{width:s,height:s}} />; })}
      <h2 className={"cta-h reveal" + (vis?" in":"")}>For <em>Generations.</em></h2>
      <p className={"cta-sub reveal d1" + (vis?" in":"")}>Start with one trip. Build an archive. Come retirement, you'll hold the whole shelf.</p>
      <div className={"cta-btns reveal d2" + (vis?" in":"")}>
        <button className="btn-p" onClick={function(){setPage("upload");}}>Begin Your Edition</button>
        <button className="btn-g" onClick={function(){setPage("preview");}}>Preview the Book</button>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-logo">Smrithi</div>
      <ul className="footer-links">
        {[["Gallery","gallery"],["Process","process"],["FAQ","faq"],["Begin","upload"]].map(function(item) {
          return <li key={item[0]}><button onClick={function(){setPage(item[1]);}}>{item[0]}</button></li>;
        })}
      </ul>
      <p className="footer-copy">© 2025 Smrithi. All rights reserved.</p>
    </footer>
  );
}

export default function App() {
  var _s = useState("home"); var page = _s[0]; var setPage = _s[1];
  var navigate = useCallback(function(p) { setPage(p); window.scrollTo({top:0,behavior:"smooth"}); }, []);
  return (
    <div className="grain">
      <GlobalStyles />
      <Cursor />
      <Navigation page={page} setPage={navigate} />
      {page === "home" && (
        <div>
          <Hero setPage={navigate} />
          <hr className="divider" />
          <About />
          <ProcessSection />
          <FinalCTA setPage={navigate} />
          <hr className="divider" />
          <Footer setPage={navigate} />
        </div>
      )}
      {page === "gallery" && (
        <div>
          <GalleryPage setPage={navigate} />
          <FinalCTA setPage={navigate} />
          <hr className="divider" />
          <Footer setPage={navigate} />
        </div>
      )}
      {page === "faq" && (
        <div>
          <FAQPage setPage={navigate} />
          <FinalCTA setPage={navigate} />
          <hr className="divider" />
          <Footer setPage={navigate} />
        </div>
      )}
      {page === "process" && (
        <div>
          <ProcessPage setPage={navigate} />
          <FinalCTA setPage={navigate} />
          <hr className="divider" />
          <Footer setPage={navigate} />
        </div>
      )}
      {page === "upload" && (
        <div>
          <UploadPage setPage={navigate} />
          <hr className="divider" />
          <Footer setPage={navigate} />
        </div>
      )}
      {page === "preview" && (
        <div>
          <PreviewPage setPage={navigate} />
          <FinalCTA setPage={navigate} />
          <hr className="divider" />
          <Footer setPage={navigate} />
        </div>
      )}
    </div>
  );
}
