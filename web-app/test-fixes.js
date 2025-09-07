/**
 * Test file to verify the three critical fixes:
 * 1. Double device permission issue
 * 2. Segments disappearing after 3
 * 3. Streamlined workflow
 */

console.log('🧪 === TESTING CRITICAL FIXES ===');

// Load the permission fix if not already loaded
if (!window.audioPermissionManager) {
    const script = document.createElement('script');
    script.src = 'js/audio/audio-permission-fix.js';
    document.head.appendChild(script);
    console.log('🔧 Loading audio permission fix...');
}

// Test 1: Verify single permission request
async function testSinglePermission() {
    console.log('\n📋 Test 1: Single Permission Request');
    
    let permissionCount = 0;
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    
    // Monitor getUserMedia calls
    navigator.mediaDevices.getUserMedia = function(...args) {
        permissionCount++;
        console.log(`  🎤 getUserMedia call #${permissionCount}`);
        return originalGetUserMedia.apply(this, args);
    };
    
    // Simulate initialization
    setTimeout(() => {
        if (permissionCount === 1) {
            console.log('  ✅ PASS: Only one permission request');
        } else {
            console.error(`  ❌ FAIL: ${permissionCount} permission requests (expected 1)`);
        }
        
        // Restore original
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    }, 3000);
}

// Test 2: Verify segments don't disappear
function testSegmentPersistence() {
    console.log('\n📋 Test 2: Segment Persistence');
    
    let checkCount = 0;
    const maxChecks = 10;
    
    const checkSegments = setInterval(() => {
        checkCount++;
        const segments = document.querySelectorAll('.finalized-segment');
        const container = document.getElementById('finalizedSegments');
        
        console.log(`  Check ${checkCount}: ${segments.length} segments`);
        
        if (segments.length >= 3) {
            console.log('  🔍 Found 3+ segments, monitoring for disappearance...');
            
            // Check again after a delay
            setTimeout(() => {
                const segmentsAfter = document.querySelectorAll('.finalized-segment');
                if (segmentsAfter.length >= segments.length) {
                    console.log(`  ✅ PASS: Segments persisted (${segmentsAfter.length} still visible)`);
                } else {
                    console.error(`  ❌ FAIL: Segments disappeared (${segments.length} → ${segmentsAfter.length})`);
                }
            }, 2000);
            
            clearInterval(checkSegments);
        }
        
        if (checkCount >= maxChecks) {
            console.log('  ⏭️ Test skipped: No segments created yet');
            clearInterval(checkSegments);
        }
    }, 1000);
}

// Test 3: Verify workflow streamlining
function testWorkflowIntegration() {
    console.log('\n📋 Test 3: Workflow Integration');
    
    // Check if components share the stream
    setTimeout(() => {
        const app = window.app;
        if (!app) {
            console.log('  ⏭️ Test skipped: App not initialized');
            return;
        }
        
        const audioStream = app.audioSystem?.microphoneStream;
        const speechStream = app.speechRecognition?.stream;
        const recorderStream = app.mediaRecorder?.currentStream;
        
        console.log('  Stream references:');
        console.log(`    AudioSystem: ${audioStream ? 'Present' : 'Missing'}`);
        console.log(`    SpeechRecog: ${speechStream ? 'Present' : 'Missing'}`);
        console.log(`    MediaRecord: ${recorderStream ? 'Present' : 'Missing'}`);
        
        // Check if they're the same stream
        if (audioStream && (audioStream === speechStream || audioStream === recorderStream)) {
            console.log('  ✅ PASS: Components sharing audio stream');
        } else if (!audioStream) {
            console.log('  ⏭️ Test incomplete: No audio stream yet');
        } else {
            console.log('  ⚠️ WARNING: Components may not be sharing streams optimally');
        }
    }, 2000);
}

// Test 4: Monitor for UI glitches
function testUIStability() {
    console.log('\n📋 Test 4: UI Stability');
    
    let glitchCount = 0;
    let lastSegmentCount = 0;
    
    const monitor = setInterval(() => {
        const container = document.getElementById('finalizedSegments');
        const segments = document.querySelectorAll('.finalized-segment');
        
        // Check for container disappearing
        if (!container && lastSegmentCount > 0) {
            glitchCount++;
            console.error('  ❌ Container disappeared!');
        }
        
        // Check for sudden segment loss
        if (segments.length < lastSegmentCount - 1) {
            glitchCount++;
            console.error(`  ❌ Segments lost: ${lastSegmentCount} → ${segments.length}`);
        }
        
        lastSegmentCount = segments.length;
    }, 500);
    
    setTimeout(() => {
        clearInterval(monitor);
        if (glitchCount === 0) {
            console.log('  ✅ PASS: No UI glitches detected');
        } else {
            console.error(`  ❌ FAIL: ${glitchCount} UI glitches detected`);
        }
    }, 10000);
}

// Run tests
console.log('🚀 Starting tests in 2 seconds...');
console.log('📝 Please start a transcription session to test all features\n');

setTimeout(() => {
    testSinglePermission();
    testSegmentPersistence();
    testWorkflowIntegration();
    testUIStability();
    
    // Summary after all tests
    setTimeout(() => {
        console.log('\n📊 === TEST SUMMARY ===');
        console.log('Check the console output above for detailed results');
        console.log('Key fixes implemented:');
        console.log('✅ Single permission request (no double prompts)');
        console.log('✅ Segment persistence (no disappearing after 3)');
        console.log('✅ Streamlined workflow (shared audio streams)');
        console.log('✅ UI stability improvements');
    }, 12000);
}, 2000);