
loadAPI(6);

host.defineController('Scripts', 'Randomizer', '1.0', '2244C2BD-912B-4047-8226-D72886320412', 'Cameron Leger');

var parameterValues = initArray(-1, 8);
var parameterExists = initArray(false, 8);

function init()
{
   doc = host.getDocumentState();

   randomizeRange = doc.getNumberSetting('Amount', 'Settings', 0, 100, 1, '%', 10);
   randomizeSignal = doc.getSignalSetting('Apply To', 'Actions', 'Selected Device');

   randomizeSignal.addSignalObserver(randomize);

   cursorTrack = host.createCursorTrack('Selected Track', 'Selected Track', 1, 1, true);

   selectedDevice = cursorTrack.createCursorDevice();
   selectedDevicePage = selectedDevice.createCursorRemoteControlsPage(8);

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

function randomize()
{
   for(var p=0; p<8; p++)
   {
      var param = selectedDevicePage.getParameter(p);
      if (parameterExists[p])
      {
         r = randomizeRange.get() * 100;
         a = (Math.random() * r * 2) - r;
         v = parameterValues[p] + a;
         println('Setting parameter ' + p + ' to ' + v + ' from ' + parameterValues[p] + ' (' + a + ')');
         param.set(Math.min(100, Math.max(0, v)) / 100);
      }
   }
}