const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kbmimkfdhblyrdskdcxc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fBTnwIh34wJb61_aXNzk6Q_sv5oZkoG';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMagicLink() {
    console.log("Testing magic link...");
    const { data, error } = await supabase.auth.signInWithOtp({
        email: 'unique_test_123_456@gmail.com',
        options: {
            emailRedirectTo: 'http://localhost:3000/conquer'
        }
    });

    if (error) {
        console.error("Error from Supabase:", error);
    } else {
        console.log("Magic link sent successfully. Data:", data);
    }
}

testMagicLink();
