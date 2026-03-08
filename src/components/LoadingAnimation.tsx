// Server component: renders raw HTML overlay BEFORE React hydrates.
// CSS-only fade ensures overlay disappears even if script doesn't execute.

export default function LoadingAnimation() {
  const overlayHTML = `
    <div id="dh-loader" style="position:fixed;inset:0;z-index:9999;background:hsl(222.2,84%,4.9%);display:flex;align-items:center;justify-content:center;pointer-events:none;animation:dh-fade 2.8s ease forwards;">
      <div style="display:flex;align-items:center;justify-content:center;width:160px;height:160px;">
        <svg viewBox="0 0 120 120" role="img" aria-label="Davin Harding" style="width:100%;height:100%;filter:drop-shadow(0 0 0 rgba(74,144,217,0));animation:dh-glow 1.7s ease forwards;">
          <path d="M32 22 H58 C74 22 84 34 84 60 C84 86 74 98 58 98 H32 Z" style="fill:rgba(74,144,217,0);stroke:#4A90D9;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:320;stroke-dashoffset:320;animation:dh-stroke 1s ease forwards,dh-fill 0.35s ease forwards 1s;" />
          <path d="M70 22 V98 M70 60 H98 M98 22 V98" style="fill:rgba(74,144,217,0);stroke:#4A90D9;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:320;stroke-dashoffset:320;animation:dh-stroke 1s ease forwards 50ms,dh-fill 0.35s ease forwards 1s;" />
        </svg>
      </div>
    </div>
    <style>
      @keyframes dh-stroke{to{stroke-dashoffset:0}}
      @keyframes dh-fill{to{fill:rgba(74,144,217,1)}}
      @keyframes dh-glow{0%,60%{filter:drop-shadow(0 0 0 rgba(74,144,217,0))}72%{filter:drop-shadow(0 0 16px rgba(74,144,217,.8))}100%{filter:drop-shadow(0 0 0 rgba(74,144,217,0))}}
      @keyframes dh-fade{0%,75%{opacity:1}100%{opacity:0;visibility:hidden;pointer-events:none}}
    </style>
    <script>
      (function(){
        var k='davinLoaderShown';
        var el=document.getElementById('dh-loader');
        if(!el)return;
        if(sessionStorage.getItem(k)==='true'){el.remove();return;}
        sessionStorage.setItem(k,'true');
        setTimeout(function(){if(el&&el.parentNode)el.parentNode.removeChild(el);},2900);
      })();
    </script>
  `;

  return <div dangerouslySetInnerHTML={{ __html: overlayHTML }} />;
}
