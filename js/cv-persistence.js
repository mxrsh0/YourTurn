// YourTurn CV persistence helper
// Loaded by the builder when we wire the form to Supabase.
(function () {
  window.YourTurnCV = {
    async save(client, userId, data) {
      const { data: cv, error: cvError } = await client.from('cvs').insert({
        user_id: userId,
        title: data.title || 'My CV',
        source: 'built',
        template: data.template || 'clean',
        status: 'draft',
        full_name: data.full_name || null,
        professional_title: data.professional_title || null,
        email: data.email || null,
        location: data.location || null,
        summary: data.summary || null
      }).select('id').single();
      if (cvError) throw cvError;

      if (data.experience?.length) {
        const { error } = await client.from('cv_experience').insert(data.experience.map((item, i) => ({
          cv_id: cv.id, job_title: item.job_title || null, employer: item.employer || null,
          location: item.location || null, start_date: item.start_date || null, end_date: item.end_date || null,
          current_role: !!item.current_role, description: item.description || null, sort_order: i
        })));
        if (error) throw error;
      }

      if (data.education?.length) {
        const { error } = await client.from('cv_education').insert(data.education.map((item, i) => ({
          cv_id: cv.id, institution: item.institution || null, qualification: item.qualification || null,
          field: item.field || null, start_date: item.start_date || null, end_date: item.end_date || null,
          description: item.description || null, sort_order: i
        })));
        if (error) throw error;
      }

      return cv.id;
    }
  };
})();
