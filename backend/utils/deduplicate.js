function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(word => word.length > 2);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

function clusterArticles(articles) {
  const clusters = [];
  const threshold = 0.4;

  for (let article of articles) {
    let added = false;

    const wordsA = cleanText(article.title);

    for (let cluster of clusters) {
      const wordsB = cleanText(cluster[0].title);

      const similarity = jaccardSimilarity(wordsA, wordsB);

      if (similarity > threshold) {
        cluster.push(article);
        added = true;
        break;
      }
    }

    if (!added) {
      clusters.push([article]);
    }
  }

  return clusters;
}
function formatClusters(clusters) {
  return clusters.map(cluster => {
    const headline = cluster[0].title;

    const sources = [...new Set(cluster.map(a => a.source))];

    return {
      headline,
      totalArticles: cluster.length,
      sources,
      articles: cluster
    };
  });
}

module.exports = { clusterArticles, formatClusters };
module.exports = { clusterArticles };