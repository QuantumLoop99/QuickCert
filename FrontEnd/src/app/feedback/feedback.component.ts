import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feedback',
  imports: [],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent implements OnInit {
  
  // Rating properties
  overallRating: number = 0;
  categoryRatings = {
    ease: 0,
    speed: 0,
    support: 0
  };

  // Statistics properties - separate counts and percentages
  stats = {
    totalReviews: 2847,
    thisMonth: 284,
    averageRating: 4.9,
    ratingCounts: {  // Keep actual counts separate
      5: 2220,  // 78% of 2847
      4: 427,   // 15% of 2847
      3: 142,   // 5% of 2847
      2: 29,    // 1% of 2847
      1: 29     // 1% of 2847
    },
    ratingPercentages: {  // Calculate percentages separately
      5: 78,
      4: 15,
      3: 5,
      2: 1,
      1: 1
    }
  };

  // Form properties
  feedbackForm = {
    userType: '',
    serviceUsed: '',
    feedbackText: '',
    suggestions: '',
    contactPermission: false,
    contactEmail: ''
  };

  ngOnInit() {
    this.initializeStarRatings();
    this.initializeForm();
    this.loadStatistics();
  }

  private initializeStarRatings() {
    // Handle overall rating stars
    const overallStars = document.querySelectorAll('.rating-section .star');
    overallStars.forEach((star, index) => {
      star.addEventListener('click', () => {
        this.setOverallRating(index + 1);
      });
      
      star.addEventListener('mouseover', () => {
        this.highlightStars(overallStars, index + 1);
      });
    });

    // Handle overall rating container mouse leave
    const overallContainer = document.querySelector('.rating-section .star-rating');
    if (overallContainer) {
      overallContainer.addEventListener('mouseleave', () => {
        this.highlightStars(overallStars, this.overallRating);
      });
    }

    // Handle category rating stars
    const categoryContainers = document.querySelectorAll('.category-rating');
    categoryContainers.forEach(container => {
      const category = container.getAttribute('data-category') as keyof typeof this.categoryRatings;
      const stars = container.querySelectorAll('.star');
      
      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          this.setCategoryRating(category, index + 1);
        });
        
        star.addEventListener('mouseover', () => {
          this.highlightStars(stars, index + 1);
        });
      });

      container.addEventListener('mouseleave', () => {
        this.highlightStars(stars, this.categoryRatings[category]);
      });
    });
  }

  private initializeForm() {
    // Handle contact permission checkbox
    const contactCheckbox = document.querySelector('input[name="contactPermission"]') as HTMLInputElement;
    const contactInfo = document.querySelector('.contact-info') as HTMLElement;
    
    if (contactCheckbox && contactInfo) {
      contactCheckbox.addEventListener('change', () => {
        this.feedbackForm.contactPermission = contactCheckbox.checked;
        contactInfo.style.display = contactCheckbox.checked ? 'block' : 'none';
      });
    }

    // Handle form submission
    const form = document.querySelector('.feedback-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitFeedback();
      });
    }

    // Handle clear form button
    const clearButton = document.querySelector('.secondary-btn') as HTMLButtonElement;
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearForm();
      });
    }
  }

  private loadStatistics() {
    // Load statistics from localStorage or use defaults
    const savedStats = localStorage.getItem('quickcert_stats');
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
      this.updateStatisticsDisplay();
    } else {
      // Initialize with calculated values
      this.recalculateFromCounts();
      this.updateStatisticsDisplay();
    }
  }

  private saveStatistics() {
    localStorage.setItem('quickcert_stats', JSON.stringify(this.stats));
  }

  private updateStatisticsAfterSubmission() {
    // Increment total reviews
    this.stats.totalReviews++;
    
    // Increment this month reviews
    this.stats.thisMonth++;
    
    // Update rating counts based on overall rating
    if (this.overallRating > 0) {
      this.stats.ratingCounts[this.overallRating as keyof typeof this.stats.ratingCounts]++;
    }
    
    // Recalculate average rating and percentages
    this.recalculateFromCounts();
    
    // Save to localStorage
    this.saveStatistics();
    
    // Update display immediately
    this.updateStatisticsDisplay();
  }

  private recalculateFromCounts() {
    const counts = this.stats.ratingCounts;
    const totalVotes = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    // Calculate weighted average
    const weightedSum = Object.entries(counts).reduce((sum, [rating, count]) => {
      return sum + (parseInt(rating) * count);
    }, 0);
    
    this.stats.averageRating = totalVotes > 0 ? Number((weightedSum / totalVotes).toFixed(1)) : 0;
    
    // Calculate percentages
    Object.keys(counts).forEach(rating => {
      const count = counts[parseInt(rating) as keyof typeof counts];
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      this.stats.ratingPercentages[parseInt(rating) as keyof typeof this.stats.ratingPercentages] = percentage;
    });

    // Update total reviews to match actual count
    this.stats.totalReviews = totalVotes;
  }

  private updateStatisticsDisplay() {
    // Update average rating
    const averageElement = document.querySelector('.stat-number');
    if (averageElement) {
      averageElement.textContent = this.stats.averageRating.toString();
    }

    // Update total reviews
    const totalReviewsElements = document.querySelectorAll('.stat-item .stat-value');
    if (totalReviewsElements.length > 0) {
      totalReviewsElements[0].textContent = this.stats.totalReviews.toLocaleString();
    }

    // Update this month reviews
    if (totalReviewsElements.length > 1) {
      totalReviewsElements[1].textContent = this.stats.thisMonth.toLocaleString();
    }

    // Update rating breakdown bars
    const ratingBars = document.querySelectorAll('.rating-bar');
    ratingBars.forEach((bar, index) => {
      const rating = 5 - index; // 5 star, 4 star, etc.
      const percentage = this.stats.ratingPercentages[rating as keyof typeof this.stats.ratingPercentages];
      
      const fillElement = bar.querySelector('.fill') as HTMLElement;
      const percentElement = bar.querySelector('.rating-percent');
      
      if (fillElement) {
        fillElement.style.width = `${percentage}%`;
      }
      if (percentElement) {
        percentElement.textContent = `${percentage}%`;
      }
    });

    // Update star display based on average rating
    const statStars = document.querySelector('.stat-stars');
    if (statStars) {
      const fullStars = Math.floor(this.stats.averageRating);
      const hasHalfStar = this.stats.averageRating % 1 >= 0.5;
      let starsHTML = '';
      
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          starsHTML += '★';
        } else if (i === fullStars + 1 && hasHalfStar) {
          starsHTML += '☆';
        } else {
          starsHTML += '☆';
        }
      }
      statStars.textContent = starsHTML;
    }

    console.log('Statistics updated:', this.stats); // Debug log
  }

  private setOverallRating(rating: number) {
    this.overallRating = rating;
    const stars = document.querySelectorAll('.rating-section .star');
    this.highlightStars(stars, rating);
    this.updateRatingText(rating);
  }

  private setCategoryRating(category: keyof typeof this.categoryRatings, rating: number) {
    this.categoryRatings[category] = rating;
    const container = document.querySelector(`[data-category="${category}"]`);
    if (container) {
      const stars = container.querySelectorAll('.star');
      this.highlightStars(stars, rating);
    }
  }

  private highlightStars(stars: NodeListOf<Element>, rating: number) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  private updateRatingText(rating: number) {
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) {
      const messages = [
        'Click to rate your overall experience',
        'Poor - We need to improve',
        'Fair - There\'s room for improvement',
        'Good - You had a decent experience',
        'Very Good - You enjoyed using our service',
        'Excellent - You love our service!'
      ];
      ratingText.textContent = messages[rating] || messages[0];
    }
  }

  private submitFeedback() {
    // Collect form data
    const formData = this.collectFormData();
    
    // Validate required fields
    if (!this.validateForm(formData)) {
      return;
    }

    // Update statistics after successful submission
    this.updateStatisticsAfterSubmission();

    // Simulate form submission
    console.log('Feedback submitted:', {
      overallRating: this.overallRating,
      categoryRatings: this.categoryRatings,
      formData: formData,
      updatedStats: this.stats
    });

    // Show success message
    this.showSuccessMessage();
  }

  private collectFormData() {
    const userType = (document.getElementById('user-type') as HTMLSelectElement)?.value || '';
    const serviceUsed = (document.getElementById('service-used') as HTMLSelectElement)?.value || '';
    const feedbackText = (document.getElementById('feedback-text') as HTMLTextAreaElement)?.value || '';
    const suggestions = (document.getElementById('suggestions') as HTMLTextAreaElement)?.value || '';
    const contactPermission = (document.querySelector('input[name="contactPermission"]') as HTMLInputElement)?.checked || false;
    const contactEmail = (document.getElementById('contact-email') as HTMLInputElement)?.value || '';

    return {
      userType,
      serviceUsed,
      feedbackText,
      suggestions,
      contactPermission,
      contactEmail
    };
  }

  private validateForm(formData: any): boolean {
    // Check if overall rating is provided
    if (this.overallRating === 0) {
      alert('Please provide an overall rating');
      return false;
    }

    // Check if user type is selected
    if (!formData.userType) {
      alert('Please select your role');
      return false;
    }

    // Check if service used is selected
    if (!formData.serviceUsed) {
      alert('Please select the service you used');
      return false;
    }

    // Check if feedback text is provided
    if (!formData.feedbackText.trim()) {
      alert('Please provide your feedback');
      return false;
    }

    // Check email if contact permission is granted
    if (formData.contactPermission && !formData.contactEmail.trim()) {
      alert('Please provide your email address');
      return false;
    }

    // Validate email format if provided
    if (formData.contactPermission && formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        alert('Please provide a valid email address');
        return false;
      }
    }

    return true;
  }

  private showSuccessMessage() {
    // Create and show success message
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
      ">
        <strong>Thank you!</strong> Your feedback has been submitted successfully.
        <br><small>Statistics updated: ${this.stats.totalReviews} total reviews</small>
      </div>
    `;

    document.body.appendChild(successDiv);

    // Remove success message after 5 seconds
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 5000);

    // Reset form after showing success
    setTimeout(() => {
      this.clearForm();
    }, 1500);
  }

  private clearForm() {
    // Reset ratings
    this.overallRating = 0;
    this.categoryRatings = { ease: 0, speed: 0, support: 0 };

    // Clear all star ratings visually
    const allStars = document.querySelectorAll('.star');
    allStars.forEach(star => star.classList.remove('active'));

    // Reset rating text
    this.updateRatingText(0);

    // Clear form inputs
    const form = document.querySelector('.feedback-form') as HTMLFormElement;
    if (form) {
      form.reset();
    }

    // Hide contact info
    const contactInfo = document.querySelector('.contact-info') as HTMLElement;
    if (contactInfo) {
      contactInfo.style.display = 'none';
    }

    // Reset form data
    this.feedbackForm = {
      userType: '',
      serviceUsed: '',
      feedbackText: '',
      suggestions: '',
      contactPermission: false,
      contactEmail: ''
    };
  }
}