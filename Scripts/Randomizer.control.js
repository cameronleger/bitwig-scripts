
loadAPI(6);

host.defineController('Scripts', 'Randomizer', '1.0', '2244C2BD-912B-4047-8226-D72886320412', 'Cameron Leger');

var parameterValues = initArray(-1, 8);
var parameterExists = initArray(false, 8);
var parameterPage = -1;
var parameterPages = -1;

var isRandomizing = false;
var originalPageIndex = -1;
var lastPage = -1;

function init()
{
   doc = host.getDocumentState();

   randomizeRange = doc.getNumberSetting('Amount', 'Settings', 0, 100, 1, '%', 10);
   randomizePages = doc.getNumberSetting('RC Pages', 'Settings', 0, 100, 1, 'Page(s)', 1);
   randomizeSignal = doc.getSignalSetting('Apply To', 'Actions', 'Selected Device');

   randomizeSignal.addSignalObserver(randomizeStart);

   cursorTrack = host.createCursorTrack('Selected Track', 'Selected Track', 1, 1, true);

   selectedDevice = cursorTrack.createCursorDevice();
   selectedDevicePage = selectedDevice.createCursorRemoteControlsPage(8);

   selectedDevicePage.selectedPageIndex().addValueObserver(function(newValue) {
      parameterPage = newValue;
      if(isRandomizing) randomizeAgain();
   });

   selectedDevicePage.pageNames().addValueObserver(function(newValue) {
      parameterPages = newValue.length;
   });

   for(var p=0; p<8; p++)
   {
      selectedDevicePage.getParameter(p).value().addValueObserver(101, makeIndexedFunction(p, function(p, newValue) {
         parameterValues[p] = newValue;
      }));
      selectedDevicePage.getParameter(p).exists().addValueObserver(makeIndexedFunction(p, function(p, exists) {
         parameterExists[p] = exists;
      }));
   }
}


function makeIndexedFunction(index, f)
{
   return function(value)
   {
      f(index, value);
   };
}

function randomizeStart()
{
   originalPageIndex = parameterPage;
   var rPages = (randomizePages.get()*100);
   if(rPages <= 0 || parameterPages === 0) return;
   lastPage = Math.min(parameterPages - 1, parameterPage + (rPages - 1));
   isRandomizing = true;
   println('Randomizing pages ' + (parameterPage + 1) + ' - ' + (lastPage + 1) + ' (max: ' + parameterPages + ')');
   randomizeAgain();
}

function randomizeNext()
{
   selectedDevicePage.selectNextPage(false);
}

function randomizeAgain()
{
   randomizer();
   if(parameterPage >= lastPage)
      randomizeFinish();
   else
      randomizeNext();
}

function randomizeFinish()
{
   println('Done!');
   isRandomizing = false;
   if(parameterPage !== originalPageIndex)
      selectedDevicePage.selectedPageIndex().set(originalPageIndex);
}

function randomizer()
{
   println('Working on Remote Control Page #' + (parameterPage + 1));
   r = randomizeRange.get() * 100;
   for(var p=0; p<8; p++)
   {
      if (parameterExists[p])
      {
         var param = selectedDevicePage.getParameter(p);
         a = (Math.random() * r * 2) - r;
         v = parameterValues[p] + a;
         println('Setting parameter ' + p + ' to ' + v + ' from ' + parameterValues[p] + ' (' + a + ')');
         param.set(Math.min(100, Math.max(0, v)) / 100);
      }
   }
}