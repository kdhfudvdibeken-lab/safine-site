'use strict';
const intro = document.getElementById('intro');
const video = document.getElementById('introVideo');
const content = document.getElementById('siteContent');
const skip = document.getElementById('skipIntro');
const sound = document.getElementById('soundButton');
const play = document.getElementById('playButton');
function closeIntro() {
  video.pause();
  intro.classList.add('closed');
  intro.inert = true;
  content.inert = false;
  document.getElementById('replay').focus({preventScroll:true});
}
function attemptPlay() {
  const promise = video.play();
  if (promise) promise.then(() => { play.hidden = true; }).catch(() => { play.hidden = false; });
}
skip.addEventListener('click', closeIntro);
video.addEventListener('ended', closeIntro);
video.addEventListener('error', () => { play.hidden = false; play.textContent = 'کلیپ در دسترس نیست؛ وارد سایت شو'; });
sound.addEventListener('click', () => {
  video.muted = !video.muted;
  sound.textContent = video.muted ? '♪ پخش با صدا' : '♪ بی‌صدا کردن';
  attemptPlay();
});
play.addEventListener('click', attemptPlay);
document.getElementById('replay').addEventListener('click', () => {
  content.inert = true;
  intro.inert = false;
  intro.classList.remove('closed');
  video.currentTime = 0;
  attemptPlay();
  skip.focus();
});
document.addEventListener('keydown', event => {
  if (!intro.classList.contains('closed') && event.key === 'Escape') closeIntro();
});
skip.focus();
attemptPlay();
// The recurring meeting is Wednesday, 20:00 in Asia/Tehran, not the visitor's timezone.
const tehranParts = new Intl.DateTimeFormat('en-US', {
  timeZone:'Asia/Tehran', year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'
});
const persian = new Intl.NumberFormat('fa-IR', {minimumIntegerDigits:2, useGrouping:false});
function nextMeeting(now) {
  const p = Object.fromEntries(tehranParts.formatToParts(now).filter(x => x.type !== 'literal').map(x => [x.type, Number(x.value)]));
  const local = Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
  const offset = local - (now.getTime() - now.getMilliseconds());
  const daysUntil = (3 - new Date(local).getUTCDay() + 7) % 7;
  let target = Date.UTC(p.year,p.month-1,p.day + daysUntil,20) - offset;
  if (target <= now.getTime()) target += 7*86400000;
  return target;
}
let target = nextMeeting(new Date());
function updateCountdown() {
  const now = new Date();
  if (now.getTime() >= target) target = nextMeeting(now);
  let remaining = Math.max(0, Math.ceil((target-now.getTime())/1000));
  const values = [Math.floor(remaining/86400),Math.floor(remaining%86400/3600),Math.floor(remaining%3600/60),remaining%60];
  ['days','hours','minutes','seconds'].forEach((id,i) => {document.getElementById(id).textContent=persian.format(values[i]);});
  document.getElementById('nextDate').textContent = new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',weekday:'long',day:'numeric',month:'long'}).format(new Date(target)) + '، ساعت ۲۰ • به وقت مشهد';
}
updateCountdown();
setInterval(updateCountdown,1000);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
