// Transcript Consistency Test
// Run this in the browser console after the app is loaded

console.log('🧪 TRANSCRIPT CONSISTENCY TEST');

const testTranscript = {
    sentences: [
        "Machine learning is a subset of artificial intelligence.",
        "Neural networks are inspired by the human brain.",
        "Deep learning uses multiple layers of processing.",
        "Supervised learning requires labeled training data.",
        "Unsupervised learning finds patterns without labels.",
        "Reinforcement learning learns through rewards and penalties.",
        "Natural language processing enables computers to understand text.",
        "Computer vision allows machines to interpret images.",
        "Transfer learning reuses knowledge from one task for another.",
        "Gradient descent optimizes model parameters iteratively."
    ],
    
    resultsSent: 0,
    segmentsDisplayed: 0,
    
    async run() {
        console.log('🚀 Starting transcript consistency test...');
        
        // Check for app in multiple locations
        const app = window.senScriptApp || window.app || window.senscript;
        
        if (!app || !app.transcriptSystem) {
            console.error('❌ App or transcript system not found!');
            console.log('Looking for: window.senScriptApp.transcriptSystem');
            console.log('Available objects:', {
                'window.senScriptApp': !!window.senScriptApp,
                'window.app': !!window.app,
                'transcriptSystem': !!(window.senScriptApp?.transcriptSystem)
            });
            return;
        }
        
        // Store app reference for convenience
        window.app = app;
        
        // Clear counters
        this.resultsSent = 0;
        this.segmentsDisplayed = 0;
        
        // Get initial segment count
        const initialSegments = document.querySelectorAll('.finalized-segment').length;
        console.log(`📊 Initial segments in DOM: ${initialSegments}`);
        
        // Ensure session is started
        if (!app.transcriptSystem.state.sessionStarted) {
            console.log('🔄 Starting transcript session...');
            app.transcriptSystem.startSession();
            await new Promise(r => setTimeout(r, 500));
        }
        
        console.log('📝 Sending test sentences...');
        console.log('=====================================');
        
        // Send all sentences
        for (let i = 0; i < this.sentences.length; i++) {
            const sentence = this.sentences[i];
            
            console.log(`📤 [${i + 1}/${this.sentences.length}] Sending: "${sentence.substring(0, 50)}..."`);
            
            // Call handleFinalText directly
            app.transcriptSystem.handleFinalText(sentence);
            this.resultsSent++;
            
            // Small delay between sentences
            await new Promise(r => setTimeout(r, 500));
        }
        
        console.log('=====================================');
        console.log('⏳ Waiting 2 seconds for segments to render...');
        
        // Wait for segments to appear
        await new Promise(r => setTimeout(r, 2000));
        
        // Count final segments
        const finalSegments = document.querySelectorAll('.finalized-segment').length;
        this.segmentsDisplayed = finalSegments - initialSegments;
        
        // Show results
        console.log('📊 TEST RESULTS:');
        console.log('=====================================');
        console.log(`📤 Results sent: ${this.resultsSent}`);
        console.log(`📥 Segments displayed: ${this.segmentsDisplayed}`);
        console.log(`📈 Success rate: ${Math.round((this.segmentsDisplayed / this.resultsSent) * 100)}%`);
        
        if (this.segmentsDisplayed === this.resultsSent) {
            console.log('✅ SUCCESS: All segments displayed correctly!');
        } else {
            console.error(`❌ FAILURE: Missing ${this.resultsSent - this.segmentsDisplayed} segments`);
            
            // Debug info
            console.log('🔍 Debug Information:');
            console.log('- Check console for [TRANSCRIPT] logs');
            console.log('- Check if UI.addFinalizedSegment is being called');
            console.log('- Verify finalizedSegmentsContainer exists');
        }
        
        return {
            sent: this.resultsSent,
            displayed: this.segmentsDisplayed,
            success: this.segmentsDisplayed === this.resultsSent
        };
    },
    
    // Helper to manually add a test segment
    addTestSegment(text) {
        const app = window.senScriptApp || window.app;
        if (!app || !app.transcriptSystem) {
            console.error('❌ App not found');
            return;
        }
        
        console.log(`📝 Adding test segment: "${text}"`);
        app.transcriptSystem.handleFinalText(text);
    },
    
    // Helper to check current state
    checkState() {
        const segments = document.querySelectorAll('.finalized-segment');
        const container = document.getElementById('finalizedSegments');
        const app = window.senScriptApp || window.app;
        
        console.log('📊 Current State:');
        console.log(`- Segments in DOM: ${segments.length}`);
        console.log(`- Container exists: ${!!container}`);
        console.log(`- Session started: ${app?.transcriptSystem?.state?.sessionStarted || false}`);
        
        if (segments.length > 0) {
            console.log('📝 Last 3 segments:');
            const recent = Array.from(segments).slice(-3);
            recent.forEach((seg, i) => {
                const text = seg.querySelector('.segment-text')?.textContent || 'No text';
                console.log(`  ${i + 1}. "${text.substring(0, 50)}..."`);
            });
        }
    },
    
    // Clear all segments
    clear() {
        const container = document.getElementById('finalizedSegments');
        if (container) {
            container.innerHTML = '';
            console.log('🧹 Transcript cleared');
        }
    }
};

// Make it globally available
window.testTranscript = testTranscript;

console.log('✅ Test loaded! Run with: testTranscript.run()');
console.log('Other commands:');
console.log('  - testTranscript.addTestSegment("your text")');
console.log('  - testTranscript.checkState()');
console.log('  - testTranscript.clear()');