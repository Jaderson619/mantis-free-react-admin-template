import React, { useState } from 'react';
import { Box, Grid, TextField, Button, Typography, Paper, InputAdornment, FormControlLabel, Checkbox, Divider, RadioGroup, Radio, IconButton } from '@mui/material';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import axios from 'axios';

export default function ProductCreate() {
  const [productType, setProductType] = useState('simple'); // 'simple' ou 'combo'
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [stockFixed, setStockFixed] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [gtin, setGtin] = useState('');
  
  // Componentes do Combo
  const [components, setComponents] = useState([{ sku: '', quantity: 1 }]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const parseCurrency = (formatted) => {
    if (!formatted) return 0;
    return Number(formatted.replace(/[^0-9,-]/g, '').replace(',', '.'));
  };

  const validate = () => {
    const newErrors = {};
    // SKU obrigatório e formato simples
    if (!sku.trim()) {
      newErrors.sku = 'Informe o SKU';
    } else if (!/^[A-Za-z0-9._-]{2,50}$/.test(sku.trim())) {
      newErrors.sku = 'Use apenas letras, números, ponto, hífen ou _ (2-50)';
    }

    // Custo obrigatório apenas para produtos simples
    if (productType === 'simple') {
      const costVal = parseCurrency(cost);
      if (!cost || isNaN(costVal)) {
        newErrors.cost = 'Informe o custo';
      } else if (costVal <= 0) {
        newErrors.cost = 'Custo deve ser > 0';
      }
    }

    // Validação de componentes se for combo
    if (productType === 'combo') {
      if (components.length === 0) {
        newErrors.components = 'Adicione pelo menos um componente ao combo';
      } else {
        components.forEach((comp, idx) => {
          if (!comp.sku.trim()) newErrors[`comp_${idx}_sku`] = 'Informe o SKU';
          if (comp.quantity <= 0) newErrors[`comp_${idx}_qtd`] = 'Qtd > 0';
        });
      }
    }

    // Imposto opcional: se informado, 0-100
    if (taxPercent) {
      const taxNum = Number(taxPercent.replace(',', '.'));
      if (isNaN(taxNum)) newErrors.taxPercent = 'Imposto inválido';
      else if (taxNum < 0 || taxNum > 100) newErrors.taxPercent = 'Intervalo 0 a 100';
    }

    // GTIN opcional: se informado apenas dígitos e tamanho válido (8,12,13,14)
    if (gtin) {
      if (!/^\d+$/.test(gtin)) newErrors.gtin = 'GTIN deve conter apenas dígitos';
      else if (![8, 12, 13, 14].includes(gtin.length)) newErrors.gtin = 'GTIN deve ter 8, 12, 13 ou 14 dígitos';
    }

    // Estoque fixo: se marcado, quantidade >=0 inteira
    if (stockFixed) {
      const q = Number(stockQuantity);
      if (isNaN(q)) newErrors.stockQuantity = 'Quantidade inválida';
      else if (!Number.isInteger(q)) newErrors.stockQuantity = 'Use número inteiro';
      else if (q < 0) newErrors.stockQuantity = 'Não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    if (!validate()) {
      setSaving(false);
      return;
    }
    try {
      const payload = {
        sku: sku.trim(),
        name: name.trim() || 'Produto sem nome',
        type: productType,
        taxPercent: taxPercent ? Number(taxPercent) : null,
        gtin: gtin.trim() || null,
        createdAt: dayjs().toISOString()
      };

      if (productType === 'simple') {
        payload.cost = parseCurrency(cost);
        payload.stock = stockFixed ? Number(stockQuantity) : null;
        payload.stockFixed = stockFixed;
      } else {
        payload.components = components.map(c => ({
          sku: c.sku.trim(),
          quantity: Number(c.quantity)
        }));
      }

      // Ajustar para endpoint real quando existir
      await axios.post('http://localhost:5001/api/products', payload);
      setMessage({ type: 'success', text: 'Produto cadastrado com sucesso!' });
      setSku('');
      setName('');
      setCost('');
      setTaxPercent('');
      setGtin('');
      setStockQuantity(1);
      setStockFixed(false);
      setProductType('simple');
      setComponents([{ sku: '', quantity: 1 }]);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao cadastrar produto.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddComponent = () => {
    setComponents([...components, { sku: '', quantity: 1 }]);
  };

  const handleRemoveComponent = (index) => {
    const newComps = [...components];
    newComps.splice(index, 1);
    setComponents(newComps);
  };

  const handleComponentChange = (index, field, value) => {
    const newComps = [...components];
    newComps[index][field] = value;
    setComponents(newComps);
  };

  return (
    <MainCard title="Cadastrar Novo Produto (SKU)">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Tipo de Produto</Typography>
            <RadioGroup
              row
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
            >
              <FormControlLabel value="simple" control={<Radio />} label="Produto Simples" />
              <FormControlLabel value="combo" control={<Radio />} label="Kit / Combo (Composto por outros produtos)" />
            </RadioGroup>
            {productType === 'combo' && (
              <Typography variant="caption" color="text.secondary">
                O custo e estoque de Kits/Combos são calculados automaticamente com base em seus componentes.
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>Dados do Produto</Typography>
            <TextField
              label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              fullWidth
              required
              margin="normal"
              error={Boolean(errors.sku)}
              helperText={errors.sku}
            />
            <TextField
              label="Nome do Produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
            />
            
            {productType === 'simple' && (
              <TextField
                label="Custo Inicial (R$)"
                value={cost}
                onChange={(e) => setCost(e.target.value.replace(/[^0-9.,]/g, ''))}
                fullWidth
                required
                margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                error={Boolean(errors.cost)}
                helperText={errors.cost}
              />
            )}
            <TextField
              label="Imposto (%)"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value.replace(/[^0-9.,]/g, ''))}
              fullWidth
              margin="normal"
              placeholder="Ex: 7,50"
              error={Boolean(errors.taxPercent)}
              helperText={errors.taxPercent}
            />
            <TextField
              label="GTIN"
              value={gtin}
              onChange={(e) => setGtin(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="GTIN do produto"
              error={Boolean(errors.gtin)}
              helperText={errors.gtin}
            />
          </Grid>

          {productType === 'simple' && (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>Estoque Fixo</Typography>
              <FormControlLabel
                control={<Checkbox checked={stockFixed} onChange={(e) => setStockFixed(e.target.checked)} />}
                label="Sim, quero manter o estoque deste SKU fixo"
              />
              <TextField
                label="Manter estoque em"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                fullWidth
                disabled={!stockFixed}
                margin="normal"
                inputProps={{ min: 0 }}
                error={Boolean(errors.stockQuantity)}
                helperText={errors.stockQuantity}
              />
              <Paper variant="outlined" sx={{ p:2, mt:2, bgcolor:'warning.lighter' }}>
                <Typography variant="caption" display="block" fontWeight={600}>Atenção:</Typography>
                <Typography variant="caption" display="block">
                  Você não poderá ter Estoque Fixo e Sincronização de Estoque ativos ao mesmo tempo. Estoque fixo possui prioridade sobre a sincronização de estoque.
                </Typography>
              </Paper>
            </Grid>
          )}

          {productType === 'combo' && (
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>Componentes do Combo</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                {errors.components && (
                  <Typography color="error" variant="caption" display="block" mb={2}>
                    {errors.components}
                  </Typography>
                )}
                {components.map((comp, idx) => (
                  <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={8}>
                      <TextField
                        size="small"
                        fullWidth
                        label={`SKU do Produto ${idx + 1}`}
                        value={comp.sku}
                        onChange={(e) => handleComponentChange(idx, 'sku', e.target.value)}
                        error={Boolean(errors[`comp_${idx}_sku`])}
                        helperText={errors[`comp_${idx}_sku`]}
                        placeholder="Ex: 83794Z-b"
                      />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Quantidade"
                        value={comp.quantity}
                        onChange={(e) => handleComponentChange(idx, 'quantity', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        error={Boolean(errors[`comp_${idx}_qtd`])}
                        helperText={errors[`comp_${idx}_qtd`]}
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton color="error" onClick={() => handleRemoveComponent(idx)} disabled={components.length === 1}>
                        <DeleteOutlined />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button variant="outlined" size="small" startIcon={<PlusOutlined />} onClick={handleAddComponent}>
                  Adicionar Componente
                </Button>
              </Paper>
            </Grid>
          )}

          {productType === 'simple' && (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>Sincronização de Estoque</Typography>
              <FormControlLabel
                control={<Checkbox disabled={stockFixed} />}
                label="Não automatizar a sincronização de baixa de estoque neste produto."
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my:2 }} />
            {message && (
              <Typography color={message.type === 'error' ? 'error.main' : 'success.main'} variant="body2">
                {message.text}
              </Typography>
            )}
            <Box mt={2} display="flex" gap={1}>
              <Button type="submit" variant="contained" disabled={saving}>Salvar</Button>
              <Button type="submit" variant="outlined" disabled={saving}>Salvar e Fechar</Button>
              <Button type="button" variant="contained" color="warning" disabled={saving}
                onClick={() => { setSku(''); setName(''); setCost(''); setTaxPercent(''); setGtin(''); setStockQuantity(1); setStockFixed(false); setProductType('simple'); setComponents([{sku:'', quantity:1}]); }}
              >Fechar</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}
