/**
 * LaTeX Generator Service
 * Generates IEEE Conference format LaTeX documents from paper data
 */

/**
 * Generate IEEE Conference format LaTeX document
 * @param {Object} paper - Paper object from database
 * @returns {String} - Complete LaTeX document
 */
const generateIEEELatex = (paper) => {
  // Helper function to escape LaTeX special characters
  const escapeLatex = (text) => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/</g, '\\textless{}')
      .replace(/>/g, '\\textgreater{}');
  };

  // Format authors for IEEE style
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) {
      return `\\author{\\IEEEauthorblockN{Author Name}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{Organization}\\\\
City, Country \\\\
email@example.com}
}`;
    }

    return authors.map((author, index) => {
      // const ordinal = getOrdinal(index + 1);
      const name = escapeLatex(author.name || `Author ${index + 1}`);
      const department = escapeLatex(author.department || '');
      const affiliation = escapeLatex(author.affiliation || 'Organization');
      const city = escapeLatex(author.city || 'City');
      const country = escapeLatex(author.country || 'Country');
      const email = escapeLatex(author.email || 'email@example.com');

      // Build author block with department if available
                                            // ${ordinal}
      let authorBlock = `\\IEEEauthorblockN{ ${name}}\n`;
      authorBlock += `\\IEEEauthorblockA{`;
      
      if (department) {
        authorBlock += `\\textit{${department}} \\\\\n`;
      }
      
      authorBlock += `\\textit{${affiliation}} \\\\\n`;
      authorBlock += `${city}, ${country} \\\\\n`;
      authorBlock += `${email}}`;

      return authorBlock;
    }).join('\n\\and\n');
  };

  // Get ordinal number (1st, 2nd, 3rd, etc.)
  // const getOrdinal = (n) => {
  //   const s = ['th', 'st', 'nd', 'rd'];
  //   const v = n % 100;
  //   return n + '\\textsuperscript{' + (s[(v - 20) % 10] || s[v] || s[0]) + '}';
  // };

  // Format keywords for IEEE style
  const formatKeywords = (keywords) => {
    if (!keywords || keywords.length === 0) {
      return 'keyword1, keyword2, keyword3';
    }
    return keywords.map(k => escapeLatex(k)).join(', ');
  };

  // Format references for IEEE style
  const formatReferences = (references) => {
    if (!references || references.length === 0) {
      return `\\bibitem{b1} Author Name, ``Paper Title,'' Journal Name, vol. X, no. Y, pp. Z-ZZ, Month Year.`;
    }

    return references.map((ref, index) => {
      const refText = escapeLatex(ref.text || ref);
      return `\\bibitem{b${index + 1}} ${refText}`;
    }).join('\n');
  };

  // Extract sections from paper content or use defaults
  const extractSections = (paper) => {
    const sections = {
      introduction: '',
      literatureReview: '',
      methodology: '',
      conclusion: ''
    };

    // Paper fields are stored directly on the paper object
    sections.introduction = escapeLatex(paper.introduction || '');
    sections.literatureReview = escapeLatex(paper.literatureReview || '');
    sections.methodology = escapeLatex(paper.methodology || '');
    sections.conclusion = escapeLatex(paper.conclusion || '');

    // Fallback: if paper has structured sections object
    if (paper.sections) {
      sections.introduction = escapeLatex(paper.sections.introduction || sections.introduction);
      sections.literatureReview = escapeLatex(paper.sections.literatureReview || paper.sections.literature || sections.literatureReview);
      sections.methodology = escapeLatex(paper.sections.methodology || paper.sections.methods || sections.methodology);
      sections.conclusion = escapeLatex(paper.sections.conclusion || sections.conclusion);
    }

    return sections;
  };

  // Get paper data with defaults
  const title = escapeLatex(paper.title || 'Conference Paper Title');
  const abstract = escapeLatex(paper.abstract || 'This document presents research findings. Please replace this abstract with your actual research abstract.');
  const authors = formatAuthors(paper.authors);
  const keywords = formatKeywords(paper.keywords);
  const references = formatReferences(paper.references);
  const sections = extractSections(paper);

  // Generate complete LaTeX document
  const latexDocument = `\\documentclass[conference]{IEEEtran}
\\IEEEoverridecommandlockouts

\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\def\\BibTeX{{\\rm B\\kern-.05em{\\sc i\\kern-.025em b}\\kern-.08em
    T\\kern-.1667em\\lower.7ex\\hbox{E}\\kern-.125emX}}

\\begin{document}

\\title{${title}}

\\author{
${authors}
}

\\maketitle

\\begin{abstract}
${abstract}
\\end{abstract}

\\begin{IEEEkeywords}
${keywords}
\\end{IEEEkeywords}

\\section{Introduction}
${sections.introduction || 'This section should contain the introduction to your research.'}

\\section{Literature Review}
${sections.literatureReview || 'This section should contain a review of related literature.'}

\\section{Methodology}
${sections.methodology || 'This section should describe your research methodology.'}

\\section{Conclusion}
${sections.conclusion || 'This section should present your conclusions and future work.'}

\\begin{thebibliography}{00}
${references}
\\end{thebibliography}

\\end{document}
`;

  return latexDocument;
};

module.exports = {
  generateIEEELatex
  // generateSpringerLatex - Coming Soon!
};
