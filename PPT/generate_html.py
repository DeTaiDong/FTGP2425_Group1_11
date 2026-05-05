from pathlib import Path
import html
import subprocess
import textwrap


BASE_DIR = Path(__file__).resolve().parent
PPTX_PATH = BASE_DIR / "EcoPassEU_Presentation.pptx"
OUTPUT_HTML = BASE_DIR / "EcoPassEU_Presentation.html"
SLIDES_DIR = BASE_DIR / "html_assets" / "slides"


def export_slides_with_powerpoint():
    """Use PowerPoint itself so the HTML matches the original deck exactly."""
    SLIDES_DIR.mkdir(parents=True, exist_ok=True)

    ps_script = rf"""
    $ErrorActionPreference = 'Stop'
    $pptx = '{str(PPTX_PATH).replace("'", "''")}'
    $out = '{str(SLIDES_DIR).replace("'", "''")}'
    New-Item -ItemType Directory -Force -Path $out | Out-Null
    Get-ChildItem $out -Filter '*.png' | Remove-Item -Force
    $app = New-Object -ComObject PowerPoint.Application
    $presentation = $app.Presentations.Open($pptx, $true, $false, $false)
    $presentation.Export($out, 'PNG', 1920, 1080)
    $count = $presentation.Slides.Count
    $presentation.Close()
    $app.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
    Write-Output $count
    """

    result = subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
        check=True,
        capture_output=True,
        text=True,
    )

    exported = sorted(
        SLIDES_DIR.glob("*.PNG"),
        key=lambda path: int("".join(ch for ch in path.stem if ch.isdigit()) or 0),
    )
    for index, old_path in enumerate(exported, start=1):
        old_path.rename(SLIDES_DIR / f"slide_{index:02d}.png")

    return int(result.stdout.strip().splitlines()[-1])


def build_html(slide_count):
    slides = "\n".join(
        f'    <section class="slide{" active" if index == 1 else ""}" data-slide="{index}">'
        f'<img src="html_assets/slides/slide_{index:02d}.png" alt="Slide {index}"></section>'
        for index in range(1, slide_count + 1)
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(PPTX_PATH.stem)}</title>
<style>
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; min-height: 100%; background: #101214; color: #f7f7f7; font-family: Arial, Helvetica, sans-serif; }}
body {{ overflow: hidden; }}
.presentation {{ position: relative; width: 100vw; height: 100vh; display: grid; place-items: center; padding: 28px; }}
.deck {{ position: relative; width: min(100%, calc((100vh - 96px) * 16 / 9)); aspect-ratio: 16 / 9; overflow: hidden; background: #fff; box-shadow: 0 22px 70px rgba(0, 0, 0, 0.45); }}
.slide {{ position: absolute; inset: 0; display: none; background: #fff; }}
.slide.active {{ display: block; }}
.slide img {{ display: block; width: 100%; height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; }}
.controls {{ position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(15, 17, 18, 0.74); border: 1px solid rgba(255, 255, 255, 0.16); backdrop-filter: blur(12px); }}
.controls button {{ min-width: 74px; height: 36px; border: 0; background: #f4f6f3; color: #172019; font-size: 14px; font-weight: 700; cursor: pointer; }}
.controls button:disabled {{ opacity: 0.42; cursor: default; }}
.slide-indicator {{ min-width: 58px; text-align: center; font-size: 13px; font-weight: 700; color: #fff; }}
@media (max-width: 720px) {{
  .presentation {{ padding: 10px; }}
  .deck {{ width: min(100%, calc((100vh - 74px) * 16 / 9)); }}
  .controls {{ bottom: 10px; }}
}}
@media print {{
  body {{ overflow: visible; background: #fff; }}
  .presentation {{ display: block; width: auto; height: auto; padding: 0; }}
  .deck {{ width: 100%; height: auto; aspect-ratio: auto; overflow: visible; box-shadow: none; }}
  .slide {{ position: relative; display: block; break-after: page; page-break-after: always; width: 100%; aspect-ratio: 16 / 9; }}
  .controls {{ display: none; }}
}}
</style>
</head>
<body>
<main class="presentation" aria-label="EcoPassEU presentation">
  <div class="deck" id="deck">
{slides}
  </div>
</main>
<nav class="controls" aria-label="Slide controls">
  <button type="button" id="prevBtn">Previous</button>
  <output class="slide-indicator" id="slideIndicator" aria-live="polite">1 / {slide_count}</output>
  <button type="button" id="nextBtn">Next</button>
</nav>
<script>
const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicator = document.getElementById('slideIndicator');
let current = 0;
function clampSlide(index) {{ return Math.max(0, Math.min(slides.length - 1, index)); }}
function showSlide(index, updateHash = true) {{
  current = clampSlide(index);
  slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === current));
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
  indicator.value = `${{current + 1}} / ${{slides.length}}`;
  indicator.textContent = indicator.value;
  if (updateHash) history.replaceState(null, '', `#${{current + 1}}`);
}}
prevBtn.addEventListener('click', () => showSlide(current - 1));
nextBtn.addEventListener('click', () => showSlide(current + 1));
document.addEventListener('keydown', (event) => {{
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {{ event.preventDefault(); showSlide(current + 1); }}
  if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) {{ event.preventDefault(); showSlide(current - 1); }}
  if (event.key === 'Home') {{ event.preventDefault(); showSlide(0); }}
  if (event.key === 'End') {{ event.preventDefault(); showSlide(slides.length - 1); }}
}});
window.addEventListener('hashchange', () => {{
  const hashSlide = Number.parseInt(location.hash.replace('#', ''), 10);
  if (Number.isFinite(hashSlide)) showSlide(hashSlide - 1, false);
}});
const initialSlide = Number.parseInt(location.hash.replace('#', ''), 10);
showSlide(Number.isFinite(initialSlide) ? initialSlide - 1 : 0, false);
</script>
</body>
</html>
"""


def main():
    if not PPTX_PATH.exists():
        raise FileNotFoundError(f"Missing PowerPoint file: {PPTX_PATH}")

    slide_count = export_slides_with_powerpoint()
    if OUTPUT_HTML.exists() and "thumbRail" in OUTPUT_HTML.read_text(encoding="utf-8"):
        print(
            f"Refreshed {slide_count} PowerPoint-rendered slide images. "
            f"Kept the enhanced HTML shell in {OUTPUT_HTML}."
        )
        return

    OUTPUT_HTML.write_text(build_html(slide_count), encoding="utf-8")
    print(f"Generated {OUTPUT_HTML} from {slide_count} PowerPoint-rendered slides.")


if __name__ == "__main__":
    main()
