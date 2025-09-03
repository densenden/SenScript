// Test script to verify transcript segments display consistently
// Run this in the browser console after the app is loaded

(function() {
    console.log('🧪 TESTING TRANSCRIPT SEGMENT DISPLAY');
    console.log('=====================================');
    
    // Find the app
    const app = window.senScriptApp;
    
    if (!app) {
        console.error('❌ App not found!');
        return;
    }
    
    if (!app.transcriptSystem) {
        console.error('❌ Transcript system not found!');
        return;
    }
    
    // Check UI initialization
    const ui = app.transcriptSystem.ui;
    console.log('✅ Transcript UI initialized:', !!ui);
    console.log('✅ Container cached:', !!ui.finalizedSegmentsContainer);
    console.log('✅ Container in DOM:', !!document.getElementById('finalizedSegments'));
    
    // Start session if needed
    if (!app.transcriptSystem.state.sessionStarted) {
        console.log('📝 Starting session...');
        app.transcriptSystem.startSession();
    }
    
    // Test function to add segments
    window.testSegments = async function() {
        console.log('🚀 Starting segment display test...');
        
        const testTexts = [
            "This is the first test segment.",
            "Machine learning is a subset of artificial intelligence.",
            "Neural networks are inspired by the human brain.",
            "Deep learning uses multiple layers of processing.",
            "Natural language processing enables text understanding."
        ];
        
        // Count initial segments
        const initialCount = document.querySelectorAll('.finalized-segment').length;
        console.log(`📊 Initial segments in DOM: ${initialCount}`);
        
        // Send test texts
        for (let i = 0; i < testTexts.length; i++) {
            console.log(`📤 [${i+1}/${testTexts.length}] Sending: "${testTexts[i]}"`);
            
            // Direct call to handleFinalText
            app.transcriptSystem.handleFinalText(testTexts[i]);
            
            // Small delay between segments
            await new Promise(r => setTimeout(r, 500));
        }
        
        // Wait for rendering
        await new Promise(r => setTimeout(r, 1000));
        
        // Count final segments
        const finalCount = document.querySelectorAll('.finalized-segment').length;
        const added = finalCount - initialCount;
        
        console.log('=====================================');
        console.log('📊 TEST RESULTS:');
        console.log(`📤 Sent: ${testTexts.length} segments`);
        console.log(`📥 Displayed: ${added} new segments`);
        console.log(`📈 Success rate: ${Math.round((added/testTexts.length)*100)}%`);
        
        if (added === testTexts.length) {
            console.log('✅ SUCCESS - All segments displayed consistently!');
        } else {
            console.error(`❌ FAILURE - Missing ${testTexts.length - added} segments`);
            console.log('🔍 Debug: Check console for [TranscriptUI] logs');
        }
        
        return { sent: testTexts.length, displayed: added };
    };
    
    // Quick add function
    window.addSegment = function(text) {
        if (!text) text = "Test segment at " + new Date().toLocaleTimeString();
        console.log(`📝 Adding: "${text}"`);
        app.transcriptSystem.handleFinalText(text);
        
        // Check if it appeared
        setTimeout(() => {
            const segments = document.querySelectorAll('.finalized-segment');
            const lastSegment = segments[segments.length - 1];
            if (lastSegment && lastSegment.textContent.includes(text)) {
                console.log('✅ Segment appeared in UI!');
            } else {
                console.error('❌ Segment not found in UI');
            }
        }, 500);
    };
    
    // Check current state
    window.checkSegments = function() {
        const segments = document.querySelectorAll('.finalized-segment');
        const container = document.getElementById('finalizedSegments');
        const ui = app.transcriptSystem.ui;
        
        console.log('📊 Current State:');
        console.log(`- Segments in DOM: ${segments.length}`);
        console.log(`- Container exists: ${!!container}`);
        console.log(`- Container cached in UI: ${!!ui.finalizedSegmentsContainer}`);
        console.log(`- Session active: ${app.transcriptSystem.state.sessionStarted}`);
        
        if (segments.length > 0) {
            const last = segments[segments.length - 1];
            const text = last.textContent || 'No text';
            console.log(`- Last segment: "${text.substring(0, 80)}..."`);
        }
        
        // Check visibility
        if (container) {
            const style = window.getComputedStyle(container);
            console.log(`- Container display: ${style.display}`);
            console.log(`- Container visibility: ${style.visibility}`);
            console.log(`- Container opacity: ${style.opacity}`);
        }
    };
    
    console.log('=====================================');
    console.log('✅ Test functions ready!');
    console.log('Commands:');
    console.log('  testSegments()    - Run full test with 5 segments');
    console.log('  addSegment()      - Add a single test segment');
    console.log('  addSegment("text") - Add custom text segment');
    console.log('  checkSegments()   - Check current state');
    console.log('=====================================');
    console.log('💡 Try: testSegments()');
})();