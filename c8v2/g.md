api.ts:1240 Error refreshing asset prices: AxiosError: Request failed with status code 404
    at settle (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:102598:30)
    at onloadend (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103002:15)
    at invoke (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44662:31)
    at dispatch (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44618:13)
    at value (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44585:17)
    at dispatchTrustedEvent (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44706:53)
    at setReadyState (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46572:139)
    at __didCompleteResponse (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46375:29)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46507:52)
    at apply (native)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2143:40)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2004:200)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2020:66)
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103718:64)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ api.ts:1240
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:127 Price update failed: Error: Price refresh endpoint not found. Please check if the backend server is running.
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:100554:26)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ priceUpdateService.ts:127
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:131 Retrying price update (attempt 1/3)
api.ts:1240 Error refreshing asset prices: AxiosError: Request failed with status code 404
    at settle (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:102598:30)
    at onloadend (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103002:15)
    at invoke (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44662:31)
    at dispatch (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44618:13)
    at value (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44585:17)
    at dispatchTrustedEvent (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44706:53)
    at setReadyState (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46572:139)
    at __didCompleteResponse (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46375:29)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46507:52)
    at apply (native)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2143:40)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2004:200)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2020:66)
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103718:64)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ api.ts:1240
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:127 Price update failed: Error: Price refresh endpoint not found. Please check if the backend server is running.
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:100554:26)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ priceUpdateService.ts:127
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:131 Retrying price update (attempt 2/3)
api.ts:1240 Error refreshing asset prices: AxiosError: Request failed with status code 404
    at settle (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:102598:30)
    at onloadend (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103002:15)
    at invoke (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44662:31)
    at dispatch (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44618:13)
    at value (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44585:17)
    at dispatchTrustedEvent (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44706:53)
    at setReadyState (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46572:139)
    at __didCompleteResponse (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46375:29)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46507:52)
    at apply (native)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2143:40)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2004:200)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2020:66)
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103718:64)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ api.ts:1240
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:127 Price update failed: Error: Price refresh endpoint not found. Please check if the backend server is running.
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:100554:26)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ priceUpdateService.ts:127
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:131 Retrying price update (attempt 3/3)
api.ts:1240 Error refreshing asset prices: AxiosError: Request failed with status code 404
    at settle (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:102598:30)
    at onloadend (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103002:15)
    at invoke (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44662:31)
    at dispatch (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44618:13)
    at value (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44585:17)
    at dispatchTrustedEvent (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44706:53)
    at setReadyState (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46572:139)
    at __didCompleteResponse (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46375:29)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46507:52)
    at apply (native)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2143:40)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2004:200)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2020:66)
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103718:64)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ api.ts:1240
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
priceUpdateService.ts:127 Price update failed: Error: Price refresh endpoint not found. Please check if the backend server is running.
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:100554:26)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ priceUpdateService.ts:127
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
console.js:654 VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
children @ VirtualizedList.js:1160
reactStackBottomFrame @ ReactFabric-dev.js:15885
beginWork @ ReactFabric-dev.js:8726
runWithFiberInDEV @ ReactFabric-dev.js:683
performUnitOfWork @ ReactFabric-dev.js:12218
workLoopSync @ ReactFabric-dev.js:12042
renderRootSync @ ReactFabric-dev.js:12022
performWorkOnRoot @ ReactFabric-dev.js:11549
performWorkOnRootViaSchedulerTask @ ReactFabric-dev.js:3073
Show 15 more frames
Show less
api.ts:1093 Error creating asset: AxiosError: Request failed with status code 400
    at settle (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:102598:30)
    at onloadend (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103002:15)
    at invoke (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44662:31)
    at dispatch (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44618:13)
    at value (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44585:17)
    at dispatchTrustedEvent (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:44706:53)
    at setReadyState (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46572:139)
    at __didCompleteResponse (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46375:29)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:46507:52)
    at apply (native)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2143:40)
    at apply (native)
    at anonymous (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2004:200)
    at emit (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:2020:66)
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:103718:64)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)
anonymous @ console.js:654
overrideMethod @ backend.js:17042
reactConsoleErrorHandler @ ExceptionsManager.js:182
anonymous @ setUpDeveloperTools.js:40
registerError @ LogBox.js:231
anonymous @ LogBox.js:80
?anon_0_ @ api.ts:1093
asyncGeneratorStep @ asyncToGenerator.js:3
_throw @ asyncToGenerator.js:20
Show 8 more frames
Show less
useAssets.ts:146 Failed to create asset: Error: Invalid asset data provided. Please check your input.
    at ?anon_0_ (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:100369:26)
    at throw (native)
    at asyncGeneratorStep (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22460:19)
    at _throw (http://10.0.2.2:8081/index.bundle//&platform=android&dev=true&lazy=true&minify=false&app=com.c9fr&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server:22477:29)
    at tryCallOne (address at InternalBytecode.js:1:1180)
    at anonymous (address at InternalBytecode.js:1:1874)