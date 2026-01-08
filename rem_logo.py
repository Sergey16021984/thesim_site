from pathlib import Path
path = Path('components/Hero.tsx')
text = path.read_text(encoding='utf-8')
target = "          {/* Logo/Brand - оптимизированный */}\n          <div className=\"mb-16 mt-8 md:mt-0\">\n            <div className=\"flex justify-center mb-6\">\n              <div className=\"text-center\">\n                <div className=\"text-4xl md:text-5xl lg:text-6xl font-bold text-blue-500 mb-4\" \n                     style={{textShadow: '0 4px 8px rgba(0,0,0,0.3)'}}\n>\n                  TheSim\n                </div>\n                <div className=\"text-lg md:text-xl text-blue-400 font-medium uppercase tracking-wider\">\n                  Smart Investments\n                </div>\n              </div>\n            </div>\n            <div className=\"w-32 h-1.5 bg-gradient-primary mx-auto rounded-full\"></div>\n          </div>\n\n"
print('exists', target in text)
if target not in text:
    raise SystemExit('missing block')
text = text.replace(target, '', 1)
path.write_text(text, encoding='utf-8')
