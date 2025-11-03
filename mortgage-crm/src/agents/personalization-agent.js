class PersonalizationAgent {
  async prepare(request) {
    const personalization = {};

    if (request.loanOfficer) {
      personalization.name = request.loanOfficer.name;
      personalization.nmls = request.loanOfficer.nmls;
      personalization.phone = request.loanOfficer.phone;
      personalization.email = request.loanOfficer.email;

      if (request.loanOfficer.photo) {
        // Process photo if needed (background removal, etc)
        personalization.photo = await this.processPhoto(request.loanOfficer.photo);
      }
    }

    return personalization;
  }

  async processPhoto(photo) {
    // Could use Replicate's rembg for background removal
    // For now, return as-is
    return photo;
  }
}

export default PersonalizationAgent;
