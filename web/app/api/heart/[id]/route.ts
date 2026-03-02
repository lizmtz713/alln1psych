import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Message ID required' },
      { status: 400 }
    );
  }
  
  try {
    // Fetch the shared heart mail
    const { data, error } = await supabase
      .from('heart_messages_shared')
      .select('*')
      .eq('share_id', id)
      .single();
    
    if (error || !data) {
      // Try looking up by direct ID
      const { data: directData, error: directError } = await supabase
        .from('heart_messages')
        .select(`
          id,
          sender_name,
          is_anonymous,
          note_type,
          content,
          created_at
        `)
        .eq('id', id)
        .eq('allow_web_view', true)
        .single();
      
      if (directError || !directData) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
      
      // Track view
      await supabase
        .from('heart_messages')
        .update({ 
          web_views: supabase.raw('COALESCE(web_views, 0) + 1'),
          last_web_view: new Date().toISOString()
        })
        .eq('id', id);
      
      return NextResponse.json({
        id: directData.id,
        senderName: directData.is_anonymous ? null : directData.sender_name,
        isAnonymous: directData.is_anonymous,
        noteType: directData.note_type,
        content: directData.content,
        createdAt: directData.created_at,
      });
    }
    
    // Check if share link has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This share link has expired' },
        { status: 410 }
      );
    }
    
    // Track view
    await supabase
      .from('heart_messages_shared')
      .update({ 
        views: (data.views || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('share_id', id);
    
    return NextResponse.json({
      id: data.message_id,
      senderName: data.is_anonymous ? null : data.sender_name,
      isAnonymous: data.is_anonymous,
      noteType: data.note_type,
      content: data.content,
      createdAt: data.created_at,
    });
    
  } catch (e) {
    console.error('[Heart API] Error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
