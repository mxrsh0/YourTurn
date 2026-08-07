// YourTurn CV persistence helper
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
        phone: data.phone || null,
        location: data.location || null,
        summary: data.summary || null,
        skills_json: data.skills || []
      }).select('id').single();
      if (cvError) throw cvError;

      if (data.experience?.length) {
        const { error } = await client.from('cv_experience').insert(data.experience.map((item, i) => ({
          cv_id: cv.id,
          job_title: item.title || null,
          employer: item.company || null,
          display_dates: item.dates || null,
          description: item.description || null,
          sort_order: i
        })));
        if (error) throw error;
      }

      if (data.education?.length) {
        const { error } = await client.from('cv_education').insert(data.education.map((item, i) => ({
          cv_id: cv.id,
          institution: item.institution || null,
          qualification: item.qualification || null,
          display_dates: item.dates || null,
          description: item.details || null,
          sort_order: i
        })));
        if (error) throw error;
      }

      const employerContact = data.employer_contact || [];
      const yourturnContact = data.yourturn_contact || [];
      const { error: preferenceError } = await client.from('job_preferences').upsert({
        user_id: userId,
        desired_roles: data.target_roles || [],
        notification_preferences: {
          employer_contact: employerContact,
          yourturn_contact: yourturnContact
        }
      }, { onConflict: 'user_id' });
      if (preferenceError) throw preferenceError;

      return cv.id;
    }
  };
})();
