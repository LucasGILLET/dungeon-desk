import { PDFDocument, StandardFonts } from 'pdf-lib'
import { type PDFCharacterData } from '@/types/pdfExport'

export function usePdfExport() {
  
  // Field mappings confirmed via pdf-form-spec.json
  const fieldMapping = {
    // Header
    CharacterName: 'CharacterName',
    ClassLevel: 'ClassLevel',
    Background: 'Background',
    PlayerName: 'PlayerName',
    Race: 'Race', 
    Alignment: 'Alignment',
    Experience: 'Experience',

    // Ability Scores & Modifiers
    STR: 'STR', STRmod: 'STRmod',
    DEX: 'DEX', DEXmod: 'DEXmod ',
    CON: 'CON', CONmod: 'CONmod',
    INT: 'INT', INTmod: 'INTmod',
    WIS: 'WIS', WISmod: 'WISmod',
    CHA: 'CHA', CHAmod: 'CHAmod',

    Inspiration: 'Inspiration',
    ProficiencyBonus: 'ProficiencyBonus',

    // Saving Throws
    ST_STR: 'ST_STR',
    ST_STR_CHECK: 'ST_STR_CHECK',

    ST_DEX: 'ST_DEX',
    ST_DEX_CHECK: 'ST_DEX_CHECK',

    ST_CON: 'ST_CON',
    ST_CON_CHECK: 'ST_CON_CHECK',

    ST_INT: 'ST_INT',
    ST_INT_CHECK: 'ST_INT_CHECK',
    
    ST_WIS: 'ST_WIS',
    ST_WIS_CHECK: 'ST_WIS_CHECK',
    
    ST_CHA: 'ST_CHA',
    ST_CHA_CHECK: 'ST_CHA_CHECK',
    
    // Skills (French names in PDF)
    Acrobatics: 'Acrobatics',
    Acrobatics_CHECK: 'Acrobatics_CHECK',
    Arcana: 'Arcana',
    Arcana_CHECK: 'Arcana_CHECK',
    Athletics: 'Athletics',
    Athletics_CHECK: 'Athletics_CHECK',
    Stealth: 'Stealth',
    Stealth_CHECK: 'Stealth_CHECK',
    AnimalHandling: 'AnimalHandling',
    AnimalHandling_CHECK: 'AnimalHandling_CHECK',
    SleightOfHand: 'SleightOfHand',
    SleightOfHand_CHECK: 'SleightOfHand_CHECK',
    History: 'History',
    History_CHECK: 'History_CHECK',
    Intimidation: 'Intimidation',
    Intimidation_CHECK: 'Intimidation_CHECK',
    Investigation: 'Investigation',
    Investigation_CHECK: 'Investigation_CHECK',
    Medicine: 'Medicine',
    Medicine_CHECK: 'Medicine_CHECK',
    Nature: 'Nature',
    Nature_CHECK: 'Nature_CHECK',
    Perception: 'Perception',
    Perception_CHECK: 'Perception_CHECK',
    Insight: 'Insight',
    Insight_CHECK: 'Insight_CHECK',
    Persuasion: 'Persuasion',
    Persuasion_CHECK: 'Persuasion_CHECK',
    Religion: 'Religion',
    Religion_CHECK: 'Religion_CHECK',
    Performance: 'Performance',
    Performance_CHECK: 'Performance_CHECK',
    Survival: 'Survival',
    Survival_CHECK: 'Survival_CHECK',
    Deception: 'Deception',
    Deception_CHECK: 'Deception_CHECK',
    
    
    PassivePerception: 'PassivePerception',
    OtherMasteries: 'OtherMasteries',
    

    // Combat Stats
    AC: 'AC',
    Initiative: 'Initiative',
    Speed: 'Speed',
    
    HPMax: 'HPMax',
    HPCurrent: 'HPCurrent',
    HPTemp: 'HPTemp',
    HDTotal: 'HDTotal',
    HD: 'HD',

    // Saving Throws Against Death
    ST_DEATH_SUCCESS_1: 'ST_DEATH_SUCCESS_1',
    ST_DEATH_SUCCESS_2: 'ST_DEATH_SUCCESS_2',
    ST_DEATH_SUCCESS_3: 'ST_DEATH_SUCCESS_3',
    ST_DEATH_FAILURE_1: 'ST_DEATH_FAILURE_1',
    ST_DEATH_FAILURE_2: 'ST_DEATH_FAILURE_2',
    ST_DEATH_FAILURE_3: 'ST_DEATH_FAILURE_3',

    // Attacks & Spells
    Attack1_Name: 'Attack1_Name',
    Attack1_Bonus: 'Attack1_Bonus',
    Attack1_Damage: 'Attack1_Damage',

    Attack2_Name: 'Attack2_Name',
    Attack2_Bonus: 'Attack2_Bonus',
    Attack2_Damage: 'Attack2_Damage',

    Attack3_Name: 'Attack3_Name',
    Attack3_Bonus: 'Attack3_Bonus',
    Attack3_Damage: 'Attack3_Damage',


    // Equipment & Monney
    Equipment: 'Equipment',
    PC: 'PC',
    PA: 'PA',
    PE: 'PE',
    PO: 'PO',
    PP: 'PP',

    // Character Mental Description
    PersonnalityTraits: 'PersonalityTraits',
    Ideals: 'Ideals',
    Bonds: 'Bonds',
    Flaws: 'Flaws',

    // Capacities & Features
    FeaturesTraits: 'FeaturesTraits',

    // Page 2 //

    // Header
    CharacterName2: 'CharacterName2',
    Age: 'Age',
    Height: 'Height',
    Weight: 'Weight',
    Eyes: 'Eyes',
    Skin: 'Skin',
    Hair: 'Hair',


    Appearance: 'Appearance',
    CharacterImage: 'CharacterImage',

    Allies: 'Allies',
    FactionName: 'FactionName',
    FactionSymbolImage: 'FactionSymbolImage',

    Backstory: 'Backstory',
    Traits: 'Feat+Traits',
    Treasure: 'Treasure',
    
  } as const;

  type FieldName = (typeof fieldMapping)[keyof typeof fieldMapping]

  const generatePdf = async (character: PDFCharacterData, pdfUrl: string = '/D&D5e-character-sheet.pdf'): Promise<Uint8Array> => {
    try {
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer())
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      
      // Auto-fix font issues
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const form = pdfDoc.getForm()
      const allFields = form.getFields()

      // Helper: Try to find a field using multiple name variations
      const findField = (name: string): any => {
         // Priority 1: Exact match
         try {
             // Use getTextField directly as user snippet suggests
             const f = form.getTextField(name);
             if (f) return f;
         } catch(e) {}
         
         // Priority 2: "Name 2" (Page 2 variant found in user snippet)
         try {
             const f2 = form.getTextField(`${name} 2`);
             if (f2) return f2;
         } catch(e) {}
         
         // Priority 3: Fuzzy / Iterative
         const trimmedName = name.trim();
         const lowerName = trimmedName.toLowerCase();
         // ... (existing fuzzy logic)
         const fuzzyMatch = allFields.find(f => {
            const fName = f.getName().trim().toLowerCase();
            return fName === lowerName || fName === `${lowerName} 2`;
         });
         
         if (fuzzyMatch && 'setText' in fuzzyMatch) return fuzzyMatch;
         return null;
      }

      const setField = (fieldName: FieldName | undefined, value: string | number | undefined) => {
        if (!fieldName || value === undefined || value === null) return;
        try {
          const field = findField(fieldName);
          if (field) {
            // @ts-ignore
            field.setText(String(value));
            
            // Stats often have font size 0 (Auto) which fails with some fonts if box is small/hidden
            // Force visible font size for stats
            if (['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].includes(fieldName)) {
                try { field.setFontSize(10); } catch(e) {}
            }
          } else {
             console.warn(`Field not found: ${fieldName}`);
          }
        } catch (e) {
          console.warn(`Error setting field ${fieldName}:`, e);
        }
      }

      const pb = 2 + Math.floor((character.level - 1) / 4)


      // --- 1. Basic Info ---
      setField(fieldMapping.CharacterName, character.name)
      setField(fieldMapping.ClassLevel, `${character.characterClass} ${character.level}`)
      setField(fieldMapping.Background, character.background)
      setField(fieldMapping.PlayerName, character.playerName)
      setField(fieldMapping.Race, character.race)
      setField(fieldMapping.Alignment, character.alignment)
      setField(fieldMapping.Experience, character.experience)
      setField(fieldMapping.Appearance, character.appearance)

      // --- 2. Ability Scores ---
      const calcMod = (score: number) => Math.floor((score - 10) / 2)
      const fmtMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`)

      setField(fieldMapping.STR, character.strength)
      setField(fieldMapping.STRmod, fmtMod(calcMod(character.strength)))
      setField(fieldMapping.DEX, character.dexterity)
      setField(fieldMapping.DEXmod, fmtMod(calcMod(character.dexterity)))
      setField(fieldMapping.CON, character.constitution)
      setField(fieldMapping.CONmod, fmtMod(calcMod(character.constitution)))
      setField(fieldMapping.INT, character.intelligence)
      setField(fieldMapping.INTmod, fmtMod(calcMod(character.intelligence)))
      setField(fieldMapping.WIS, character.wisdom)
      setField(fieldMapping.WISmod, fmtMod(calcMod(character.wisdom)))
      setField(fieldMapping.CHA, character.charisma)
      setField(fieldMapping.CHAmod, fmtMod(calcMod(character.charisma)))

      // --- 2b. Saving Throws ---
      // On suppose que la maîtrise d'un jet de sauvegarde = maîtrise de la compétence correspondante (à adapter si besoin)
      const savingThrows = [
        { field: fieldMapping.ST_STR, checkField: fieldMapping.ST_STR_CHECK, value: character.strength, prof: character.strengthCheck },
        { field: fieldMapping.ST_DEX, checkField: fieldMapping.ST_DEX_CHECK, value: character.dexterity, prof: character.dexterityCheck },
        { field: fieldMapping.ST_CON, checkField: fieldMapping.ST_CON_CHECK, value: character.constitution, prof: character.constitutionCheck },
        { field: fieldMapping.ST_INT, checkField: fieldMapping.ST_INT_CHECK, value: character.intelligence, prof: character.intelligenceCheck },
        { field: fieldMapping.ST_WIS, checkField: fieldMapping.ST_WIS_CHECK, value: character.wisdom, prof: character.wisdomCheck },
        { field: fieldMapping.ST_CHA, checkField: fieldMapping.ST_CHA_CHECK, value: character.charisma, prof: character.charismaCheck },
      ]
      savingThrows.forEach(({ field, checkField, value, prof }) => {
        if (field) setField(field, fmtMod(calcMod(value) + (prof ? pb : 0)))
        if (checkField) {
          const checkbox = form.getCheckBox(checkField)
          if (checkbox) {
            if (prof) checkbox.check()
            else checkbox.uncheck()
          }
        }
      })

      // --- 3. Combat Stats ---
      setField(fieldMapping.AC, character.armorClass)
      const initVal = character.initiative
      setField(fieldMapping.Initiative, initVal >= 0 ? `+${initVal}` : `${initVal}`)
      setField(fieldMapping.Speed, character.speed)
      setField(fieldMapping.HPMax, character.hpMax)
      setField(fieldMapping.HPCurrent, character.hpCurrent)
      setField(fieldMapping.HDTotal, character.level)
      setField(fieldMapping.HD, character.hitDice)

      // --- 4. Skills & Proficiency ---
      setField(fieldMapping.ProficiencyBonus, `+${pb}`)
      setField(fieldMapping.Inspiration, `0`)
      setField(fieldMapping.PassivePerception, 10 + calcMod(character.wisdom))
      setField(fieldMapping.OtherMasteries, character?.otherMasteries || "")

      // Helper to set skill bonus and checkboxes
      const setSkill = (field: FieldName, prof: boolean, abilityScore: number, checkField?: string) => {
        const mod = calcMod(abilityScore)
        const total = mod + (prof ? pb : 0)
        setField(field, fmtMod(total))
        if (checkField) {
          const checkbox = form.getCheckBox(checkField)          
          if (checkbox) {
            if (prof) {
              checkbox.check()
            } else {
              checkbox.uncheck()
            }
          }
        }
      }
      setSkill(fieldMapping.Acrobatics, character.acrobatics, character.dexterity, fieldMapping.Acrobatics_CHECK)
      setSkill(fieldMapping.AnimalHandling, character.animalHandling, character.wisdom, fieldMapping.AnimalHandling_CHECK)
      setSkill(fieldMapping.Arcana, character.arcana, character.intelligence, fieldMapping.Arcana_CHECK)
      setSkill(fieldMapping.Athletics, character.athletics, character.strength, fieldMapping.Athletics_CHECK)
      setSkill(fieldMapping.Deception, character.deception, character.charisma, fieldMapping.Deception_CHECK)
      setSkill(fieldMapping.History, character.history, character.intelligence, fieldMapping.History_CHECK)
      setSkill(fieldMapping.Insight, character.insight, character.wisdom, fieldMapping.Insight_CHECK)
      setSkill(fieldMapping.Intimidation, character.intimidation, character.charisma, fieldMapping.Intimidation_CHECK)
      setSkill(fieldMapping.Investigation, character.investigation, character.intelligence, fieldMapping.Investigation_CHECK)
      setSkill(fieldMapping.Medicine, character.medicine, character.wisdom, fieldMapping.Medicine_CHECK)
      setSkill(fieldMapping.Nature, character.nature, character.intelligence, fieldMapping.Nature_CHECK)
      setSkill(fieldMapping.Perception, character.perception, character.wisdom, fieldMapping.Perception_CHECK)
      setSkill(fieldMapping.Performance, character.performance, character.charisma, fieldMapping.Performance_CHECK)
      setSkill(fieldMapping.Persuasion, character.persuasion, character.charisma, fieldMapping.Persuasion_CHECK)
      setSkill(fieldMapping.Religion, character.religion, character.intelligence, fieldMapping.Religion_CHECK)
      setSkill(fieldMapping.SleightOfHand, character.sleightOfHand, character.dexterity, fieldMapping.SleightOfHand_CHECK)
      setSkill(fieldMapping.Stealth, character.stealth, character.dexterity, fieldMapping.Stealth_CHECK)
      setSkill(fieldMapping.Survival, character.survival, character.wisdom, fieldMapping.Survival_CHECK)

      // --- 5. Attaques (3 max) ---
      if (Array.isArray(character.attacks)) {
        const attackFieldMappings = [
          { name: fieldMapping.Attack1_Name, bonus: fieldMapping.Attack1_Bonus, damage: fieldMapping.Attack1_Damage },
          { name: fieldMapping.Attack2_Name, bonus: fieldMapping.Attack2_Bonus, damage: fieldMapping.Attack2_Damage },
          { name: fieldMapping.Attack3_Name, bonus: fieldMapping.Attack3_Bonus, damage: fieldMapping.Attack3_Damage },
        ]

        for (let i = 0; i < attackFieldMappings.length; i++) {
          const atk = character.attacks[i]
          const mapping = attackFieldMappings[i]
          if (!mapping) continue
          setField(mapping.name, atk?.name || "")
          setField(mapping.bonus, atk?.bonus || "")
          setField(mapping.damage, atk?.damage || "")
        }
      }

      // --- 6. Équipement & Monnaie ---
      setField(fieldMapping.Equipment, character.equipment || "")
      setField(fieldMapping.PC, character.pc || "")
      setField(fieldMapping.PA, character.pa || "")
      setField(fieldMapping.PE, character.pe || "")
      setField(fieldMapping.PO, character.po || "")
      setField(fieldMapping.PP, character.pp || "")

      // --- 7. Description mentale & Capacités ---
      setField(fieldMapping.PersonnalityTraits, character.personalityTraits || "")
      setField(fieldMapping.Ideals, character.ideals || "")
      setField(fieldMapping.Bonds, character.bonds || "")
      setField(fieldMapping.Flaws, character.flaws || "")
      setField(fieldMapping.FeaturesTraits, character.featuresTraits || "")

      // --- 8. Fluff & Descriptions (Page 2) ---
      setField(fieldMapping.CharacterName2, character.name)

      setField(fieldMapping.Age, character.age)
      setField(fieldMapping.Height, character.height)
      setField(fieldMapping.Weight, character.weight)
      setField(fieldMapping.Eyes, character.eyes)
      setField(fieldMapping.Skin, character.skin)
      setField(fieldMapping.Hair, character.hair)
      setField(fieldMapping.Backstory, character.backstory)
      setField(fieldMapping.Traits, character.traits)
      setField(fieldMapping.Treasure, character.treasure)
      setField(fieldMapping.Allies, character.allies)
      setField(fieldMapping.FactionName, character.factionName)

      // --- 9. Images ---
      if (character.imageUrl) {
        try {
          const imgBytes = await fetch(character.imageUrl).then(res => res.arrayBuffer())
          let image;
          try { image = await pdfDoc.embedPng(imgBytes) } catch (e) {
            try { image = await pdfDoc.embedJpg(imgBytes) } catch(e) {}
          }
          if (image) {
            try {
              const imageField = form.getButton(fieldMapping.CharacterImage)
              if (imageField) imageField.setImage(image)
            } catch(e) {}
          }
        } catch (e) {
          console.warn('Failed to embed character image:', e)
        }
      }
      if (character.factionSymbolUrl) {
        try {
          const imgBytes = await fetch(character.factionSymbolUrl).then(res => res.arrayBuffer())
          let image;
          try { image = await pdfDoc.embedPng(imgBytes) } catch (e) {
            try { image = await pdfDoc.embedJpg(imgBytes) } catch(e) {}
          }
          if (image) {
            try {
              const factionImageField = form.getButton(fieldMapping.FactionSymbolImage)
              if (factionImageField) factionImageField.setImage(image)
            } catch(e) {}
          }
        } catch (e) {
          console.warn('Failed to embed faction image:', e)
        }
      }

      // Force update appearances
      try {
        form.updateFieldAppearances(font) 
      } catch (e) {
        console.warn('Error updating field appearances:', e)
      }

      return await pdfDoc.save()

    } catch (error) {
      console.error('Error in generatePdf:', error)
      throw error
    }
  }

  const downloadPdf = (pdfBytes: Uint8Array, filename: string = 'character-sheet.pdf') => {
    const normalizedBytes = Uint8Array.from(pdfBytes)
    const blob = new Blob([normalizedBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return { generatePdf, downloadPdf }
}
