targets, factors
CriticalSize, !(CriticalSize | Cdc20andCdc14)
Cln3, CriticalSize & !Cdc20andCdc14 & !Fus3
Sic1, ((Cdc20andCdc14 | Sic1) & !(Clb2 | Cln2 | Clb5)) | ((Cdc20 | Sic1) & Hog1)
Cln2, (Cln3 | Cln2) & !Clb2 & !Fus3 & !Hog1
Clb5, Cln3 & !(Sic1 | Clb2 | Cdc20andCdc14) & !Hog1
Swe1, (Cln2 & !(Clb5 | Clb2)) | (Swe1 & Hog1)
Clb2, ((Clb5 & Cln2) | Clb2) & !(Sic1 | Cdc20 | Swe1) & CriticalSize
Cdc20andCdc14, (Clb2 | Cdc20) & CriticalSize







