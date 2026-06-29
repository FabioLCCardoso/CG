import os

def separar_obj(caminho_ficheiro):
    with open(caminho_ficheiro, 'r') as f:
        linhas = f.readlines()
    
    # Captura vértices, normais e texturas (globais)
    vertices = [l for l in linhas if l.startswith(('v ', 'vn ', 'vt '))]
    mtllib = [l for l in linhas if l.startswith('mtllib ')]
    
    objetos = {}
    objeto_atual = None
    
    for linha in linhas:
        if linha.startswith('o ') or linha.startswith('g '):
            objeto_atual = linha.strip().split()[1]
            if objeto_atual not in objetos:
                objetos[objeto_atual] = []
        # Guarda faces (f) e materiais (usemtl) pertencentes ao objeto
        elif objeto_atual is not None and not linha.startswith(('v ', 'vn ', 'vt ')):
            objetos[objeto_atual].append(linha)
            
    os.makedirs('modelos_separados', exist_ok=True)
    
    for nome, linhas_obj in objetos.items():
        caminho_saida = f"modelos_separados/{nome}.obj"
        with open(caminho_saida, 'w') as f:
            f.writelines(mtllib)
            f.writelines(vertices) # Preserva os índices originais 
            f.write(f"o {nome}\n")
            f.writelines(linhas_obj)
            
    print(f"Sucesso! Foram separados {len(objetos)} modelos na pasta 'modelos_separados'.")

# Certifica-te de que o ficheiro .obj está na mesma pasta que o script
separar_obj('LowPolyDungeonAssets.obj')