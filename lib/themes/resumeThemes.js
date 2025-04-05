// Resume theme styles for the resume builder
// Each theme contains styling information for different resume elements

export const getThemeStyles = (theme) => {
  switch (theme) {
    case 'modern':
      return {
        fontFamily: "'Helvetica Neue', sans-serif",
        primaryColor: '#3498db',
        headingColor: '#2980b9',
        sectionBg: 'bg-blue-50',
        nameClass: 'text-3xl font-bold text-blue-700'
      };
    case 'professional':
      return {
        fontFamily: "'Georgia', serif",
        primaryColor: '#2c3e50',
        headingColor: '#34495e',
        sectionBg: 'bg-gray-50',
        nameClass: 'text-3xl font-bold text-gray-800'
      };
    case 'harvard':
      return {
        fontFamily: "'Garamond', 'Times New Roman', serif",
        primaryColor: '#000000', // Changed to black (was Harvard Crimson)
        headingColor: '#000000', // Changed to black
        borderColor: '#000000', // All black borders
        sectionBg: 'bg-gray-50',
        nameClass: 'text-3xl font-bold uppercase text-black',
        sectionHeadingClass: 'uppercase text-lg tracking-wider pb-1 mb-3 font-bold',
        layout: 'harvard', // Used for special Harvard-specific layout adjustments
        textColor: 'text-black', // Black text color throughout
        hideSummary: true, // Flag to hide summary section
        hideIcons: true, // Flag to hide all icons
        useVerticalBars: true, // Use vertical bars between contact info
        // Harvard style uses uppercase section headings and has stronger emphasis on education
        contentStyle: {
          heading: 'uppercase tracking-wider',
          contentSpacing: 'mb-3',
          jobTitle: 'font-bold',
          companyName: 'italic',
          dateStyle: 'font-normal text-right',
          mainText: 'text-black',
        }
      };
    case 'classic':
    default:
      return {
        fontFamily: "'Arial', sans-serif",
        primaryColor: '#27ae60',
        headingColor: '#16a085',
        sectionBg: 'bg-green-50',
        nameClass: 'text-3xl font-bold text-green-700'
      };
  }
};

// Available themes list
export const availableThemes = ['classic', 'modern', 'professional', 'harvard']; 