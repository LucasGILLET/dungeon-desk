export interface FeatureDescription {
  name: string
  description: string
}

const featureDescriptions: Record<string, string> = {
  // Lignée Draconique (Ensorceleur)
  'Ancêtre draconique': 'Vous choisissez un type de dragon comme ancêtre. Le type de dégâts associé à chaque dragon est utilisé par les capacités que vous gagnez plus tard.',
  'Résistance draconique': 'Au niveau 1, vos points de vie maximum augmentent de 1 et augmentent de 1 à nouveau chaque fois que vous gagnez un niveau dans cette classe. De plus, des parties de votre peau sont recouvertes d\'une fine pellicule d\'écailles ressemblant à celles d\'un dragon, vous conférant une classe d\'armure de 13 + votre modificateur de Dextérité tant que vous ne portez pas d\'armure.',
  'Affinité élémentaire': 'Au niveau 6, quand vous lancez un sort qui inflige des dégâts du type associé à votre héritage draconique, vous pouvez ajouter votre modificateur de Charisme à l\'un des jets de dégâts de ce sort. De plus, vous pouvez dépenser 1 point de sorcellerie pour gagner une résistance aux dégâts du type associé à votre héritage draconique pendant 1 heure.',
  'Ailes draconiques': 'Au niveau 14, vous gagnez la capacité de faire pousser une paire d\'ailes de dragon dans votre dos, vous accordant une vitesse de vol égale à votre vitesse actuelle.',
  'Présence draconique': 'Au niveau 18, vous pouvez canaliser la présence redoutable de votre ancêtre dragon, causant la terreur ou l\'émerveillement chez les créatures autour de vous.',

  // Magie Sauvage (Ensorceleur)
  'Poussée de magie sauvage': 'Votre magie jaillit de façon imprévisible. Une fois par tour, le MD peut vous demander de lancer un d20 immédiatement après avoir lancé un sort d\'ensorceleur de niveau 1 ou plus. Si vous faites un 1, cela crée un effet magique aléatoire.',
  'Marées de chaos': 'À partir du niveau 1, vous pouvez manipuler les forces du hasard et du chaos pour gagner un avantage sur un jet d\'attaque, de caractéristique ou de sauvegarde une fois entre deux longs repos. Si cette capacité est en cours de rechargement, vous créez automatiquement un effet aléatoire au prochain sort de niveau 1 ou plus lancé, puis vous récupérez cette capacité.',
  'Chance surnaturelle': 'Au niveau 6, vous avez appris à plier légèrement la chance à votre volonté. Quand une autre créature que vous pouvez voir dans un rayon de 9 mètres de vous fait un jet d\'attaque, un jet de caractéristique ou un jet de sauvegarde, vous pouvez utiliser votre réaction et 2 points de sorcellerie pour lui imposer un bonus ou malus de 1d4 sur son jet.',
  'Chaos contrôlé': 'Au niveau 14, vous gagnez un contrôle modéré sur vos poussées de magie sauvage. Chaque fois que vous lancez sur la table de Poussée de magie sauvage, vous pouvez lancer deux fois et utiliser l\'un ou l\'autre résultat.',
  'Bombardement de sorts': 'Au niveau 18, l\'énergie magique nocive qui vous traverse peut surcharger vos sorts. Quand vous lancez un dé de dégâts pour un sort et que ce dé de dégâts fait les dégâts maximaux possibles, vous pouvez lancer un dé de dégâts supplémentaire pour ce sort. Vous pouvez utiliser cet effet une fois par tour.',

  // Domaine de la Guerre (Clerc)
  'Prêtre guerrier': 'Dès le niveau 1, votre dieu vous accorde une maîtrise des armures lourdes et des armes martiales.',
  'Sorts de domaine (Guerre - Niv 1)': 'Vous gagnez les sorts Faveur divine et Bouclier de la foi. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Frappe guidée': 'À partir du niveau 2, vous pouvez utiliser votre Canalisation Divine pour frapper avec une précision surnaturelle. Quand vous faites un jet d\'attaque, vous pouvez utiliser votre Canalisation Divine pour gagner un bonus de +10 au jet. Vous devez décider d\'utiliser cette capacité avant de savoir si l\'attaque réussit ou échoue.',
  'Sorts de domaine (Guerre - Niv 3)': 'Vous gagnez les sorts Arme spirituelle et Arme magique. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Sorts de domaine (Guerre - Niv 5)': 'Vous gagnez les sorts Esprits gardiens et Hâte. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Bénédiction de guerre': 'Au niveau 6, quand une créature dans un rayon de 9 mètres de vous effectue un jet d\'attaque, vous pouvez utiliser votre Canalisation Divine pour accorder un bonus de +10 au jet. Vous devez décider d\'utiliser cette capacité avant de savoir si l\'attaque réussit ou échoue.',
  'Sorts de domaine (Guerre - Niv 7)': 'Vous gagnez les sorts Liberté de mouvement et Frappe en flammes. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Frappe guerrière': 'Au niveau 8, vous gagnez la capacité d\'imprégner vos frappes d\'arme d\'énergie divine. Une fois par tour, lorsque vous touchez une créature avec une attaque à l\'arme, vous pouvez infliger 1d8 dégâts supplémentaires du même type que votre arme. Au niveau 14, les dégâts supplémentaires augmentent à 2d8.',
  'Sorts de domaine (Guerre - Niv 9)': 'Vous gagnez les sorts Colonne de flamme et Domination de personne. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Avatar de bataille': 'Au niveau 17, vous gagnez une résistance aux dégâts contondants, perforants et tranchants d\'armes non magiques.',

  // Domaine de la Vie (Clerc)
  'Disciple de la vie': 'À partir du niveau 1, vous gagnez la maitrise des armures lourdes. De plus, vos sorts de soins sont plus efficaces : chaque fois que vous utilisez un sort de niveau 1 ou plus pour rendre des points de vie à une créature, la créature récupère 2 + le niveau du sort utilisé points de vie supplémentaire.',
  'Sorts de domaine (Vie - Niv 1)': 'Vous gagnez les sorts Bénédiction et Soin des blessures. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Préservation de la vie': 'À partir du niveau 2, vous pouvez utiliser votre Canalisation Divine et une action pour soigner un nombre de points de vie égal à 5 fois votre niveau de clerc. Vous pouvez répartir ce soin entre plusieurs créatures dans un rayon de 9 mètres de vous, et vous ne pouvez pas soigner une créature au-delà de la moitié de son maximum de points de vie.',
  'Sorts de domaine (Vie - Niv 3)': 'Vous gagnez les sorts Restauration partielle et Prière de guérison. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Sorts de domaine (Vie - Niv 5)': 'Vous gagnez les sorts Lueur d\'espoir et Revigoration. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Guérisseur béni': 'À partir du niveau 6, les sorts de guérison que vous lancez sur les autres vous guérissent également. Quand vous lancez un sort de niveau 1 ou plus pour rendre des points de vie à une créature autre que vous, vous récupérez un nombre de points de vie égal à 2 + le niveau du sort.',
  'Sorts de domaine (Vie - Niv 7)': 'Vous gagnez les sorts Gardien de la foi et Liberté de mouvement. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Frappe divine': 'Au niveau 8, vous gagnez la capacité d\'imprégner vos frappes d\'arme d\'énergie divine. Une fois par tour, lorsque vous touchez une créature avec une attaque à l\'arme, vous pouvez infliger 1d8 dégâts radiants supplémentaires. Au niveau 14, les dégâts supplémentaires augmentent à 2d8.',
  'Sorts de domaine (Vie - Niv 9)': 'Vous gagnez les sorts Soins de groupe et Rappel à la vie. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Guérison suprême': 'À partir du niveau 17, quand vous lanceriez normalement un ou plusieurs dés pour rendre des points de vie avec un sort, vous utilisez à la place le nombre le plus élevé possible pour chaque dé.',

  // Domaine de la Lumière (Clerc)
  'Sort mineur bonus': 'Quand vous choisissez ce domaine au niveau 1, vous gagnez le sort mineur Lumière si vous ne le connaissez pas déjà.',
  'Lueur protectrice': 'À partir du niveau 1, vous pouvez interposer une lumière divine entre vous et un ennemi qui attaque. Quand une créature dans un rayon de 9 mètres de vous que vous pouvez voir vous attaque, vous pouvez utiliser votre réaction pour lui imposer un désavantage sur son jet d\'attaque. Un attaquant qui ne peut pas être aveuglé n\'est pas affecté par cette capacité. Vous pouvez utiliser cette capacité un nombre de fois égal à votre modificateur de Sagesse (minimum une fois). Vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos long.',
  'Sorts de domaine (Lumière - Niv 1)': 'Vous gagnez les sorts Lueurs féeriques et Mains brûlantes. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Rayonnement du soleil': 'À partir du niveau 2, vous pouvez utiliser votre Canalisation Divine pour faire exploser de lumière solaire. Pour une action, vous présentez votre symbole divin et faites briller une lumière éclatante dans un rayon de 9 mètres autour de vous, dispersant les ténèbres magiques. Aussi, chaque créature hostile dans ce rayon doit réussir un jet de sauvegarde de Constitution ou subir 2d10+votre niveau de clerc, de dégâts radiants Une créature qui réussit son jet de sauvegarde subit la moitié des dégâts.',
  'Sorts de domaine (Lumière - Niv 3)': 'Vous gagnez les sorts Sphère de feu et Rayon ardent. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Sorts de domaine (Lumière - Niv 5)': 'Vous gagnez les sorts Lumière du jour et Boule de feu. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Lueur protectrice améliorée': 'À partir du niveau 6, vous pouvez également utiliser votre capacité Lueur protectrice quand une créature que vous pouvez voir dans un rayon de 9 mètres de vous attaque une créature autre que vous.',
  'Sorts de domaine (Lumière - Niv 7)': 'Vous gagnez les sorts Gardien de la foi et Mur de feu. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Amélioration des sorts mineurs': 'À partir du niveau 8, vous ajoutez votre modificateur de Sagesse aux jets de dégâts de vos sorts mineurs.',
  'Sorts de domaine (Lumière - Niv 9)': 'Vous gagnez les sorts Colonne de flamme et Modification de mémoire. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Couronne de lumière': 'À partir du niveau 17, vous pouvez utiliser votre action pour activer une aura de lumière solaire qui dure 1 minute ou jusqu\'à ce que vous la révoquiez par une action. Vous rayonnez une lumière brillante dans un rayon de 18 mètres et une lumière faible supplémentaire dans un rayon de 9 mètres au-delà. De plus, chaque créature hostile dans le rayon central subit un désavantage sur tous ses jets de sauvegarde contre tous les sorts infligeant des dégâts radiants ou de feu.',

  // Domaine de la Nature (Clerc)
  'Acolyte de la nature': 'Au niveau 1, vous apprenez un sort mineur de druide de votre choix. Vous gagnez également la maîtrise de l\'une des compétences suivantes : Dressage, Nature ou Survie.',
  'Maîtrise des armures lourdes': 'Vous gagnez la maîtrise des armures lourdes.',
  'Sorts de domaine (Nature - Niv 1)': 'Vous gagnez les sorts Baies magiques et Communication avec les animaux. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Charme des animaux et des plantes': 'À partir du niveau 2, vous pouvez utiliser votre Canalisation Divine pour charmer les animaux et les plantes. Comme action, vous présentez votre symbole divin : toutes les créatures animales et végétales dans un rayon de 9 mètres de vous qui peuvent vous voir doivent réussir un jet de sauvegarde de Sagesse ou être charmées par vous pendant 1 minute ou jusqu\'à ce qu\'elle prenne des dégâts. Une créature charmée par cette capacité ne peut pas attaquer vous ou vos alliés, et vous avez un avantage aux tests de compétence pour interagir socialement avec elle. Une créature qui réussit son jet de sauvegarde est immune à cette capacité pendant 24 heures.',
  'Sorts de domaine (Nature - Niv 3)': 'Vous gagnez les sorts Croissance d\'épines et Peau d\'écorce. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Sorts de domaine (Nature - Niv 5)': 'Vous gagnez les sorts Croissance végétale et Mur de vent. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Résistance aux éléments': 'À partir du niveau 6, quand vous ou une créature dans un rayon de 9 mètres de vous subissez des dégâts d\'acide, de froid, de feu, de foudre ou de tonnerre, vous pouvez utiliser votre réaction pour vous/lui accorder une résistance à ce type de dégâts pour cette instance de dégâts.',
  'Sorts de domaine (Nature - Niv 7)': 'Vous gagnez les sorts Domination de bête et Liberté de mouvement. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Frappe élémentaire': 'Au niveau 8, vous gagnez la capacité d\'imprégner vos frappes d\'arme d\'énergie divine. Une fois par tour, lorsque vous touchez une créature avec une attaque à l\'arme, vous pouvez infliger 1d8 dégâts de froid, de feu ou électrique (votre choix) supplémentaires. Au niveau 14, les dégâts supplémentaires augmentent à 2d8.',
  'Sorts de domaine (Nature - Niv 9)': 'Vous gagnez les sorts Communion avec la nature et Fléau d\'insectes. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Maître de la nature': 'Au niveau 17, vous gagnez la capacité de commander aux animaux et aux plantes. Pendant que ces créatures sont charmées par votre Charme des animaux et des plantes, vous pouvez utiliser une action bonus pour leur ordonner verbalement de faire une action spécifique pendant leur prochain tour.',

  // Domaine de la Duperie (Clerc)
  'Bénédiction du filou': 'À partir du niveau 1, vous pouvez utiliser votre action pour toucher une créature consentante autre que vous pour lui donner un avantage sur les jets de Dextérité (Discrétion). Cette effet dure 1 heure ou jusqu\'à ce que vous utilisiez cette capacité à nouveau.',
  'Sorts de domaine (Duperie - Niv 1)': 'Vous gagnez les sorts Charme-personne et Déguisement. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Invoquer un double': 'À partir du niveau 2, vous pouvez utiliser votre Canalisation Divine et une action pour créer un double illusoire de vous-même qui dure une minute ou jusqu\'à ce que vous perdiez votre Concentration. L\'illusion apparaît dans un espace non occupé que vous pouvez voir à 9 mètres de vous, vous pouvez utiliser une action bonus pour la faire bouger jusqu\'à 9 mètres mais elle doit toujours rester à moins de 36 mètres de vous. Pendant la durée du sort, vous pouvez lancer des sorts comme si vous étiez à la place de l\'illusion, mais vous devez utiliser vos propres sens. De plus, lorsque vous (et votre illusion) vous trouvez à moins de 3 mètres d\'une créature qui peut voir l\'illusion vous gagnez un avantage sur vos jets d\'attaque contre cette créature.',
  'Sorts de domaine (Duperie - Niv 3)': 'Vous gagnez les sorts Image miroir et Passage sans trace. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Sorts de domaine (Duperie - Niv 5)': 'Vous gagnez les sorts Clignotement et Invisibilité. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Canalisation Divine : Manteau d\'ombre': 'À partir du niveau 6, vous pouvez utiliser votre Canalisation Divine pour disparaître dans les ombres. Avec une action, vous pouvez vous envelopper dans une ombre magique, devenant invisible jusqu\'au début de votre prochain tour ou jusqu\'à ce que vous attaquiez ou que vous lanciez un sort.',
  'Sorts de domaine (Duperie - Niv 7)': 'Vous gagnez les sorts Confusion et Polymorph. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Frappe furtive': 'Au niveau 8, vous gagnez la capacité d\'imprégner vos frappes d\'arme d\'énergie divine. Une fois par tour, lorsque vous touchez une créature avec une attaque à l\'arme, vous pouvez infliger 1d8 dégâts de poison supplémentaires. Au niveau 14, les dégâts supplémentaires augmentent à 2d8.',
  'Sorts de domaine (Duperie - Niv 9)': 'Vous gagnez les sorts Domination de personne et Modification de mémoire. Ces sorts sont toujours préparés et ne comptent pas dans votre limite de sorts préparés.',
  'Duperie améliorée': 'Au niveau 17, vous pouvez créer jusqu\'à quatre doubles de vous-même, au lieu d\'un seul, quand vous utilisez Invoquer un double.',

  // Le Grand Ancien (Occultiste)
  'Télépathie': 'À partir du niveau 1, votre contact extraterrestre vous donne la capacité de communiquer télépathiquement avec d\'autres créatures. Vous pouvez communiquer télépathiquement avec toute créature que vous pouvez voir dans un rayon de 9 mètres de vous. Vous n\'avez pas besoin de partager une langue avec la créature pour communiquer de cette manière, mais la créature doit être capable de comprendre au moins une langue.',
  'Sorts étendus (Grand Ancien - Niv 1)': 'Vous gagnez les sorts Dissonance mentale et Sommeil. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Grand Ancien - Niv 3)': 'Vous gagnez les sorts Détection des pensées et Suggestion. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Grand Ancien - Niv 5)': 'Vous gagnez les sorts Clairvoyance et Envoyer un message. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Protection psychique': 'À partir du niveau 6, le Grand Ancien vous donne la capacité de protéger votre esprit contre certaines formes d\'attaques. Quand une créature fait un jet d\'attaque contre vous, vous pouvez utiliser votre réaction pour imposer un désavantage au jet. Si l\'attaque rate, le prochain jet d\'attaque que vous faites contre cette créature a un avantage si vous l\'effectuez avant la fin de votre prochain tour. Vous pouvez utiliser cette capacité une fois entre deux courts ou longs repos.',
  'Sorts étendus (Grand Ancien - Niv 7)': 'Vous gagnez les sorts Domination de personne et Invocation d\'élémentaire. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Grand Ancien - Niv 9)': 'Vous gagnez les sorts Modification de mémoire et Télékinésie. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Résistance psychique': 'Au niveau 10, vos pensées ne peuvent plus être lues par télépathie ou d\'autres moyens magiques, à moins que vous ne le permettiez. De plus, vous avez une résistance aux dégâts psychiques et lorsqu\'une créature vous inflige des dégâts psychiques, elle subit le même montant de dégâts en retour.',
  'Créer un serviteur': 'Au niveau 14, vous gagnez la capacité d\'infecter l\'esprit d\'un humanoïde avec la magie extraterrestre de votre patron. Avec une action, vous pouvez toucher un humanoïde Incapacité. Cette créature est désormais charmée par vous jusqu\'à ce que le sort Dissipation de Malédiction soit utilisé sur elle, qu\'elle perde l\'effet de charme, ou que vous utilisiez cette capacité à nouveau. Vous pouvez communiquer par télépathie avec la créature charmée du moment que vous êtes toutes les deux sur le même plan d\'existence.',
  
  // L'Archifée (Occultiste)
  'Présence féerique': 'À partir du niveau 1, votre patron vous confère la capacité de projeter la présence séduisante ou terrifiante des fées. Avec une action, vous pouvez forcer chaque créature hostile dans un rayon de 9 mètres de vous qui peut vous voir à réussir un jet de sauvegarde de Sagesse ou être charmée ou effrayée par vous (votre choix) jusqu\'à la fin de votre prochain tour. Vous pouvez utiliser cette capacité une fois entre deux courts ou longs repos.',
  'Sorts étendus (Archifée - Niv 1)': 'Vous gagnez les sorts Lueurs féeriques et Sommeil. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Archifée - Niv 3)': 'Vous gagnez les sorts Apaisement des émotions et Suggestion. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Archifée - Niv 5)': 'Vous gagnez les sorts Clignotement et Croissance végétale. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Fuite brumeuse': 'À partir du niveau 6, vous pouvez disparaître dans un nuage de brume en réaction aux dégâts. Lorsque vous subissez des dégâts, vous pouvez utiliser votre réaction pour devenir invisible et vous téléporter jusqu\'à 18 mètres vers un espace non occupé que vous pouvez voir. Vous restez invisible jusqu\'au début de votre prochain tour ou jusqu\'à ce que vous attaquiez ou lanciez un sort. Vous pouvez utiliser cette capacité une fois entre deux courts ou longs repos.',
  'Sorts étendus (Archifée - Niv 7)': 'Vous gagnez les sorts Domination de bête et Invisibilité supérieure. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Archifée - Niv 9)': 'Vous gagnez les sorts Domination de personne et Téléportation. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Défenses de charme': 'À partir du niveau 10, votre patron vous enseigne comment retourner les effets mentaux magiques dirigés contre vous. Vous êtes immunisé à l\'effet de charme et, quand une créature tente de vous charmer, vous pouvez utiliser votre réaction pour essayer de retourner l\'effet contre elle. La créature doit réussir un jet de sauvegarde de Sagesse contre votre DD de sort ou être charmée par vous pendant 1 minute ou jusqu\'à ce qu\'elle prenne des dégâts.',
  'Délire ensorcelant': 'À partir du niveau 14, vous pouvez plonger une créature dans un royaume illusoire. Avec une action, vous pouvez choisir une créature dans un rayon de 18 mètres de vous que vous pouvez voir. La créature doit réussir un jet de sauvegarde de Sagesse contre votre DD de sort ou être charmée ou effrayée (votre choix) par vous pendant 1 minute ou jusqu\'à ce qu\'elle prenne des dégâts. Jusqu\'à la fin de l\'illusion, la créature croit être perdue dans un espace brumeux, à l\'apparence de votre choix. La créature ne peut voir et entendre que vous, elle-même, et l\'illusion. Vous pouvez utiliser cette capacité une fois entre deux courts ou longs repos.',
  
  // Le Fiélon (Occultiste)
  'Bénédiction du Ténébreux': 'À partir du niveau 1, quand vous réduisez une créature hostile à 0 point de vie, vous gagnez un nombre de points de vie temporaires égal à votre modificateur de Charisme + votre niveau d\'Occultiste.',
  'Sorts étendus (Fiélon - Niv 1)': 'Vous gagnez les sorts Mains brûlantes et Injonction. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Fiélon - Niv 3)': 'Vous gagnez les sorts Cécité/Surdité et Rayon ardent. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Fiélon - Niv 5)': 'Vous gagnez les sorts Boule de feu et Colonne de flamme. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Résistance du fiélon': 'À partir du niveau 6, vous pouvez invoquer la puissance de votre patron pour altérer le destin en votre faveur. Quand vous faites un jet de compétence ou un jet de sauvegarde, vous pouvez utiliser cette compétence pour ajouter un 1d10 à votre jet. Vous devez décider d\'utiliser cette capacité avant de savoir si le jet réussit ou échoue. Vous pouvez utiliser cette capacité une fois entre deux courts ou longs repos.',
  'Sorts étendus (Fiélon - Niv 7)': 'Vous gagnez les sorts Mur de feu et Porte dimensionnelle. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Sorts étendus (Fiélon - Niv 9)': 'Vous gagnez les sorts Colonne de flamme et Sanctification. Ces sorts comptent comme des sorts d\'occultiste pour vous, mais ne comptent pas dans votre nombre de sorts connus.',
  'Résistance fiélonne': 'Au niveau 10, vous pouvez choisir un type de dégâts quand vous terminez un repos court ou long. Vous gagnez une résistance à ce type de dégâts. Les dégâts en provenance des armes magiques ou d\'armes en argent ignorent cette résistance.',
  'Traverser les Enfers': 'À partir du niveau 14, quand vous touchez une créature avec une attaque, vous pouvez utiliser cette compétence pour transporter instantanément la créature au travers des plans inférieurs. A la fin de votre prochain tour, la créature réapparaît dans le même espace ou dans l\'espace le plus proche disponible. Si la créature n\'est pas un démon, elle subit 10d10 de dégâts psychiques. Vous pouvez utiliser cette capacité une fois entre deux longs repos.',
}

export function getFeatureDescription(featureName: string): string {
  return featureDescriptions[featureName] || 'Description non disponible pour cette capacité.'
}

import type { SRDFeature } from '@/types/srd'
import { loadFeatures } from '@/utils/dataLoader'

export async function getFeaturesByClassAndLevel(classIndex: string, level: number = 1): Promise<SRDFeature[]> {
  const allFeatures = await loadFeatures()
  
  return allFeatures.filter(feature => 
    feature.class.index === classIndex && 
    feature.level <= level
  )
}

export async function getAllFeaturesByClass(classIndex: string): Promise<SRDFeature[]> {
  const allFeatures = await loadFeatures()
  
  return allFeatures.filter(feature => 
    feature.class.index === classIndex
  )
}

export function getFeatureDescriptionFromSRD(feature: SRDFeature): string {
  return feature.desc.join(' ')
}
