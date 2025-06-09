
export class DebugService {
  static logUserAuth = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('=== AUTH DEBUG ===');
    console.log('User data:', userData);
    console.log('User error:', userError);
    console.log('User ID:', userData.user?.id);
    console.log('User email:', userData.user?.email);
    return userData.user;
  };

  static logDatabaseConnection = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    console.log('=== DATABASE DEBUG ===');
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      console.log('Database connection test - Profiles query:', { data, error });
      return !error;
    } catch (err) {
      console.error('Database connection failed:', err);
      return false;
    }
  };

  static logRLSPolicies = async (tableName: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    console.log(`=== RLS DEBUG FOR ${tableName.toUpperCase()} ===`);
    
    // Test basic read access
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      console.log(`${tableName} read test:`, { data, error });
    } catch (err) {
      console.error(`${tableName} read failed:`, err);
    }
  };
}
