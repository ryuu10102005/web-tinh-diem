async function calculateScore(params, input) {
  // Khai báo Tham số (Parameters)
  const alpha = params.alpha;
  const FlagshipBonus = params.FlagshipBonus;
  const C95_Flagship = params.C95_Flagship;
  const C95_NonFlagship = params.C95_NonFlagship;
  const Weight_Journal = params.Weight_Journal;
  const Weight_Impact = params.Weight_Impact;

  const sjr = Number(input.sjr_percentile_p); 
  const cites = Number(input.cites_3_5y);     
  const role = Number(input.role_weight);    
  const flagship = input.is_flagship === true || input.is_flagship === "1";
  const C95 = flagship ? C95_Flagship : C95_NonFlagship;
 
  const JournalBaseScoreNoBonus = Math.pow((100 - sjr) / 100, alpha) * 100;
  
  const JournalBonus = flagship ? FlagshipBonus : 0;
  const JournalBase = JournalBaseScoreNoBonus + JournalBonus;
  const JournalScore = Math.min(100, JournalBase);

  const ImpactScoreBase = Math.min(100 * Math.log10(1 + cites) / Math.log10(1 + C95));
  
  const ImpactScore = Math.min(100, ImpactScoreBase);

  const PaperScore =
    Weight_Journal * JournalScore +
    Weight_Impact * ImpactScore;

  const PaperScoreAdj = Math.min(PaperScore * role, 100);

  return {
    JournalBase, 
    JournalScore,
    ImpactScore,
    PaperScore,
    PaperScoreAdj
  };
}

module.exports = { calculateScore };