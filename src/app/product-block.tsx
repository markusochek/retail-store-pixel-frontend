import React from 'react';

const ProductBlock = () => {
    return (
        <>
            <div style={{display: "flex", flexDirection: "column"}}>
                <img height={"100px"} width={"100px"} src="37522b69_4c36_11f0_84a5_0cc47adeeeb3_2465ba59_4cce_11f0_84a5_0cc47adeeeb3.webp" alt="error loaded"/>
                <span>
                {
                    `Код: 10212557
                    Каталка №0373 "Поезд" с ручкой/пакет/20*11*14
                    Зарегистрируйтесь, если Вы покупаете товар оптом
                    Розничная цена`
                }
              </span>
            </div>
        </>
    );
};

export default ProductBlock;