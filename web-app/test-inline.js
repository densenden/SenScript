// Copy and paste this entire block into the browser console

(function() {
    console.log('🧪 TRANSCRIPT TEST - INLINE VERSION');
    
    // Find the app
    const app = window.senScriptApp || window.app || window.senscript;
    
    if (!app) {
        console.error('❌ App not found. Available globals:', Object.keys(window).filter(k => k.includes('app') || k.includes('App') || k.includes('sen')));
        return;
    }
    
    if (!app.transcriptSystem) {
        console.error('❌ Transcript system not found on app object. Available properties:', Object.keys(app));
        return;
    }
    
    console.log('✅ App and transcript system found!');
    
    // Test function
    window.testTranscript = async function() {
        console.log('🚀 Starting transcript test...');
        
        const sentences = [
            "This is test sentence number one.",
            "Machine learning is fascinating.",
            "Neural networks process information.",
            "Testing the transcript system.",
            "Final test sentence here."
        ];
        
        // Ensure session started
        if (!app.transcriptSystem.state.sessionStarted) {
            console.log('Starting session...');
            app.transcriptSystem.startSession();
            await new Promise(r => setTimeout(r, 500));
        }
        
        // Count initial segments
        const initialCount = document.querySelectorAll('.finalized-segment').length;
        console.log(`Initial segments: ${initialCount}`);
        
        // Send sentences
        for (let i = 0; i < sentences.length; i++) {
            console.log(`Sending [${i+1}/${sentences.length}]: "${sentences[i]}"`);
            app.transcriptSystem.handleFinalText(sentences[i]);
            await new Promise(r => setTimeout(r, 500));
        }
        
        // Wait and count
        await new Promise(r => setTimeout(r, 2000));
        
        const finalCount = document.querySelectorAll('.finalized-segment').length;
        const added = finalCount - initialCount;
        
        console.log('=====================================');
        console.log(`📊 RESULTS:`);
        console.log(`📤 Sent: ${sentences.length} sentences`);
        console.log(`📥 Displayed: ${added} new segments`);
        console.log(`✅ Success rate: ${Math.round((added/sentences.length)*100)}%`);
        
        if (added === sentences.length) {
            console.log('✅ SUCCESS - All segments displayed!');
        } else {
            console.error(`❌ FAILURE - Missing ${sentences.length - added} segments`);
        }
        
        return { sent: sentences.length, displayed: added };
    };
    
    // Quick test function
    window.quickTest = function(text) {
        if (!text) text = "Quick test at " + new Date().toLocaleTimeString();
        console.log(`📝 Adding: "${text}"`);
        app.transcriptSystem.handleFinalText(text);
    };
    
    // Check state function
    window.checkTranscript = function() {
        const segments = document.querySelectorAll('.finalized-segment');
        const container = document.getElementById('finalizedSegments');
        
        console.log('📊 Transcript State:');
        console.log(`- Segments visible: ${segments.length}`);
        console.log(`- Container exists: ${!!container}`);
        console.log(`- Session active: ${app.transcriptSystem?.state?.sessionStarted || false}`);
        
        if (segments.length > 0) {
            const last = segments[segments.length - 1];
            const text = last.querySelector('.segment-text')?.textContent || 'No text';
            console.log(`- Last segment: "${text.substring(0, 50)}..."`);
        }
    };
    
    console.log('✅ Test functions ready!');
    console.log('Commands:');
    console.log('  testTranscript()  - Run full test with 5 sentences');
    console.log('  quickTest()       - Add a single test segment');
    console.log('  quickTest("text") - Add custom text segment');
    console.log('  checkTranscript() - Check current state');
})();